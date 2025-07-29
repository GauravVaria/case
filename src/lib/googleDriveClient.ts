// src/lib/googleDriveClient.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export function getDriveClient(tokens: AuthTokens): { drive: ReturnType<typeof google.drive>, auth: OAuth2Client } {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    // No redirect URI needed here, as we're just using tokens
  );

  auth.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken, // Include refresh token if available for refreshing
    expiry_date: tokens.expiresAt ? tokens.expiresAt * 1000 : undefined, // Convert seconds to milliseconds
  });

  // Optional: Set up an event listener to refresh tokens if they expire
  // In a real app, you'd want to persist the refreshed tokens.
  auth.on('tokens', (refreshedTokens) => {
    if (refreshedTokens.access_token) {
      console.log("Access token was refreshed!");
      // Here, you would typically save the new access_token and expiry_date to your database
      // associated with the user's session/account to ensure continued access.
      // For this example, we're assuming the token retrieved from NextAuth is valid for the current session.
    }
  });


  const drive = google.drive({ version: 'v3', auth });
  return { drive, auth };
}

// Helper to find a specific file by name in Google Drive
export async function findFileByName(drive: ReturnType<typeof google.drive>, fileName: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  return res.data.files && res.data.files.length > 0 ? res.data.files[0].id : null;
}