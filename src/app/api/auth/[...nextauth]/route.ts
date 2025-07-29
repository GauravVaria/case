// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
        token.accessToken = account.access_token;
        token.id = user.id; // Store user ID in the token
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a JWT.
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
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
    user: {
      id?: string | null; // User ID from the JWT
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string; // Custom property stored in the JWT
  }
}