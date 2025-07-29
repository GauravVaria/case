// src/app/api/cases/load/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDriveClient, findFileByName } from '@/lib/googleDriveClient';
import { Case } from '@/types/case';
import type { NextRequest } from 'next/server'; // IMPORT NextRequest

// Change req: Request to req: NextRequest
export async function GET(req: NextRequest) { // <-- FIX IS HERE
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
      res.data
        .on('data', (chunk: Buffer) => (fileContent += chunk.toString()))
        .on('end', () => resolve())
        .on('error', (err: unknown) => {
          if (err instanceof Error) {
            reject(err);
          } else {
            reject(new Error(String(err)));
          }
        });
    });

    const cases: Case[] = JSON.parse(fileContent);
    return NextResponse.json(cases, { status: 200 });

  } catch (error: unknown) {
    console.error('Failed to load cases from Google Drive:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '');
    return NextResponse.json({ message: 'Failed to load cases', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}