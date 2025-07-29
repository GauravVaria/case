// src/app/api/cases/save/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDriveClient, findFileByName } from '@/lib/googleDriveClient';
import { Case, Installment, Hearing, CourtVisit } from '@/types/case';

const CASE_FILE_NAME = 'my_lawyer_cases.json';
const FOLDER_NAME = 'LawyerApp_CaseData';

const calculateBalanceForCase = (quotation: number, initialInvoiceAmount: number, installments: Installment[], hearings: Hearing[]): number => {
  const totalPaymentsReceived = (installments || []).reduce((sum, inst) => sum + inst.amount, 0) || 0;
  const totalHearingFees = (hearings || []).reduce((sum, hearing) => sum + hearing.feesCharged, 0) || 0;
  return quotation - (initialInvoiceAmount + totalPaymentsReceived + totalHearingFees);
};

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { drive } = getDriveClient({ accessToken: token.accessToken as string });
    const cases: Case[] = await req.json();

    let folderId: string | null = null;
    try {
        folderId = await findFileByName(drive, FOLDER_NAME);
        if (!folderId) {
            const folderMetadata = {
                'name': FOLDER_NAME,
                'mimeType': 'application/vnd.google-apps.folder'
            };
            const folderRes = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id',
            });
            folderId = folderRes.data.id!;
        }
    } catch (folderError: any) { // Keep `any` here for broader error catching, or make more specific if possible
        console.error("Error finding or creating folder:", folderError.message);
        return NextResponse.json({ message: 'Error managing Google Drive folder' }, { status: 500 });
    }

    const fileContent = JSON.stringify(cases, null, 2);

    let fileId: string | null = null;
    try {
      fileId = await findFileByName(drive, CASE_FILE_NAME);
    } catch (findError: any) { // Keep `any` here for broader error catching
      console.warn("Error finding file, attempting to create:", findError.message);
    }

    if (fileId) {
      await drive.files.update({
        fileId: fileId,
        addParents: folderId!,
        media: {
          mimeType: 'application/json',
          body: fileContent,
        },
      });
      return NextResponse.json({ message: 'Cases updated successfully in Google Drive', fileId });
    } else {
      const fileMetadata = {
        name: CASE_FILE_NAME,
        mimeType: 'application/json',
        parents: [folderId!],
      };
      const res = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: 'application/json',
          body: fileContent,
        },
        fields: 'id',
      });
      return NextResponse.json({ message: 'Cases saved successfully to Google Drive', fileId: res.data.id });
    }

  } catch (error: any) { // Keep `any` here for broader error catching
    console.error('Failed to save cases to Google Drive:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to save cases', error: error.message }, { status: 500 });
  }
}