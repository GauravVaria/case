// src/app/api/cases/load/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDriveClient, findFileByName } from '@/lib/googleDriveClient';
import { Case } from '@/types/case'; // Import your Case type

const CASE_FILE_NAME = 'my_lawyer_cases.json'; // Must match the file name used in save route

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { drive } = getDriveClient({ accessToken: token.accessToken as string });

    const fileId = await findFileByName(drive, CASE_FILE_NAME);

    if (!fileId) {
      // File does not exist, return empty array
      return NextResponse.json<Case[]>([], { status: 200 });
    }

    // Download the file content
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    let fileContent = '';
    await new Promise<void>((resolve, reject) => {
      res.data
        .on('data', (chunk: Buffer) => (fileContent += chunk.toString()))
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err));
    });

    const cases: Case[] = JSON.parse(fileContent);
    return NextResponse.json(cases, { status: 200 });

  } catch (error: any) {
    console.error('Failed to load cases from Google Drive:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to load cases', error: error.message }, { status: 500 });
  }
}