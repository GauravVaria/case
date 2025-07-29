// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    // Example: If you want to protect a specific route like /dashboard
    // If the user is not authenticated and tries to access /dashboard, they will be redirected
    // if (req.nextUrl.pathname.startsWith("/dashboard") && !req.nextauth.token) {
    //   return NextResponse.redirect(new URL("/auth/signin", req.url));
    // }

    // Example: Restrict /admin to only users with a specific role
    // if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
    //   return NextResponse.rewrite(new URL("/denied", req.url)); // Redirect to a denied access page
    // }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This function determines if the user is authorized to access the matched routes.
        // If 'token' exists (is not null), the user is authenticated.
        return !!token;
      },
    },
    // Specify the custom sign-in page to redirect to if authorization fails
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  // Specify which paths this middleware applies to.
  // This matcher protects all routes except:
  // - API routes (/api/*)
  // - Next.js internal files (_next/static/*, _next/image/*)
  // - Favicon
  // - Your custom sign-in page itself (/auth/signin)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)"],
};