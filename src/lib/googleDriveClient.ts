// src/lib/googleDriveClient.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export function getDriveClient(tokens: AuthTokens): { drive: ReturnType<typeof google.drive>, auth: OAuth2Client } {
  // console.log("getDriveClient: GOOGLE_CLIENT_ID status:", process.env.GOOGLE_CLIENT_ID ? "LOADED" : "NOT LOADED");
  // console.log("getDriveClient: GOOGLE_CLIENT_SECRET status:", process.env.GOOGLE_CLIENT_SECRET ? "LOADED" : "NOT LOADED");


  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt ? tokens.expiresAt * 1000 : undefined,
  });

  auth.on('tokens', (refreshedTokens) => {
    if (refreshedTokens.access_token) {
      console.log("Access token was refreshed in getDriveClient! New token:", refreshedTokens.access_token);
    }
  });

  const drive = google.drive({ version: 'v3', auth });
  return { drive, auth };
}

// Helper to find a specific file by name in Google Drive - FIX IS HERE
export async function findFileByName(drive: ReturnType<typeof google.drive>, fileName: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  // FIX: Use nullish coalescing to explicitly convert undefined to null
  return res.data.files && res.data.files.length > 0 ? (res.data.files[0].id ?? null) : null; // <-- CORRECTED LINE
}