// src/app/api/cases/load/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDriveClient, findFileByName } from '@/lib/googleDriveClient';
import { Case } from '@/types/case';

const CASE_FILE_NAME = 'my_lawyer_cases.json';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { drive } = getDriveClient({ accessToken: token.accessToken as string });

    const fileId = await findFileByName(drive, CASE_FILE_NAME);

    if (!fileId) {
      return NextResponse.json<Case[]>([], { status: 200 });
    }

    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    let fileContent = '';
    await new Promise<void>((resolve, reject) => {
      // Changed 'chunk: any' to 'chunk: Buffer' for data event
      res.data
        .on('data', (chunk: Buffer) => (fileContent += chunk.toString()))
        // Changed 'err: any' to 'err: Error' for error event
        .on('error', (err: Error) => reject(err))
        .on('end', () => resolve());
    });

    const cases: Case[] = JSON.parse(fileContent);
    return NextResponse.json(cases, { status: 200 });

  } catch (error: any) { // Keep `any` here for broader error catching, or make more specific if possible
    console.error('Failed to load cases from Google Drive:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to load cases', error: error.message }, { status: 500 });
  }
}