// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server"; // Now import explicitly as it's used
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  // `middleware` is a Next.js middleware function
  function middleware(_req: NextRequest & { nextauth: { token: JWT | null } }) { // Add underscore
    // ... your middleware logic ...
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)"],
};