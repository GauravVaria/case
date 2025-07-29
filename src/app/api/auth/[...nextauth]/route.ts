// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file", // 'drive.file' grants access to files created by your app
          // If you need to see all files in user's drive, use 'https://www.googleapis.com/auth/drive.readonly' or 'drive'
        },
      },
    }),
  ],
  // Session strategy for App Router
  session: {
    strategy: "jwt",
  },
  // Secret for signing and encrypting session tokens
  secret: process.env.NEXTAUTH_SECRET as string,
  // Optional: Define custom pages for sign-in, sign-out, etc.
  // If not defined, NextAuth.js will use its default pages.
  pages: {
    signIn: "/auth/signin", // We will create this custom page next
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
  },
  // Callbacks to customize JWT and Session behavior
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token; // NextAuth's internal access_token from Google
        token.refreshToken = account.refresh_token; // If you need long-lived access
        token.googleIdToken = account.id_token; // Google's specific ID token
        token.expires_at = account.expires_at; // Expiration time
        token.providerAccountId = account.providerAccountId; // User's Google ID
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a JWT.
      // Expose the Google Access Token to the session for use in API routes
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.googleIdToken as string; // Optional: if you need Google's ID token
      session.expiresAt = token.expires_at as number; // Optional: for checking token expiry
      session.user.providerAccountId = token.providerAccountId as string; // Optional: Google user ID
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Extend the NextAuth.js interfaces to include custom properties
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      providerAccountId?: string | null; // Google user ID
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    googleIdToken?: string;
    expires_at?: number;
    providerAccountId?: string;
  }
}