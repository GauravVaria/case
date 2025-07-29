// src/app/api/cases/save/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDriveClient, findFileByName } from '@/lib/googleDriveClient';
import { Case, Installment, Hearing, CourtVisit } from '@/types/case'; // Import all your types

const CASE_FILE_NAME = 'my_lawyer_cases.json';
const FOLDER_NAME = 'LawyerApp_CaseData';

// Helper to calculate balance (copied from HomePage/CaseList)
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
    const cases: Case[] = await req.json(); // Get the cases from the request body

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
    } catch (folderError: any) {
        console.error("Error finding or creating folder:", folderError.message);
        return NextResponse.json({ message: 'Error managing Google Drive folder' }, { status: 500 });
    }

    const fileContent = JSON.stringify(cases, null, 2); // Pretty print JSON

    let fileId: string | null = null;
    try {
      fileId = await findFileByName(drive, CASE_FILE_NAME);
    } catch (findError: any) {
      console.warn("Error finding file, attempting to create:", findError.message);
    }


    if (fileId) {
      // Update existing file - MODIFIED HERE
      await drive.files.update({
        fileId: fileId,
        // Remove 'parents' from requestBody, use addParents/removeParents instead
        // requestBody: fileMetadata, // This line is no longer correct.
        addParents: folderId!, // Add the folder ID where the file should be (or already is)
        // removeParents: 'old-parent-id', // Only if you are actually moving the file
        media: {
          mimeType: 'application/json',
          body: fileContent,
        },
      });
      return NextResponse.json({ message: 'Cases updated successfully in Google Drive', fileId });
    } else {
      // Create new file (this part was already correct)
      const fileMetadata = { // Define fileMetadata here for create operation
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

  } catch (error: any) {
    console.error('Failed to save cases to Google Drive:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to save cases', error: error.message }, { status: 500 });
  }
}