// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// REMOVE THE 'export' KEYWORD HERE
const authOptions: NextAuthOptions = { // <--- Changed from 'export const' to 'const'
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user: _user, account, profile: _profile }) { // Add underscores for unused params
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.googleIdToken = account.id_token;
        token.expires_at = account.expires_at;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token, user: _user }) { // Add underscore for unused param
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.googleIdToken as string;
      session.expiresAt = token.expires_at as number;
      session.user.id = token.id as string;
      session.user.providerAccountId = token.providerAccountId as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Extend the NextAuth.js interfaces (these are fine)
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
      providerAccountId?: string | null;
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