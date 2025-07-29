// src/app/auth/signin/page.tsx
"use client"; // This is a client component

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation"; // For getting callbackUrl and error

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error"); // Get the error message from NextAuth.js
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Get the URL to redirect to after successful sign-in

  let errorMessage: string | null = null;
  if (error) {
    switch (error) {
      case "OAuthAccountNotLinked":
        errorMessage = "This email is already in use with another account. Please try signing in with your existing account or a different email.";
        break;
      case "CredentialsSignin":
        errorMessage = "Invalid credentials. Please check your username and password."; // If you had a credentials provider
        break;
      case "OAuthSignin":
      case "OAuthCallback":
      case "Callback":
      case "CSRF":
      case "JSONParseError":
      case "Event":
      default:
        errorMessage = "An unexpected error occurred. Please try again.";
        console.error("NextAuth Error:", error); // Log the detailed error for debugging
        break;
    }
  }


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "20px",
        textAlign: "center",
        fontFamily: "sans-serif",
        backgroundColor: "#282c34",
        color: "#abb2bf",
      }}
    >
      <h1 style={{ color: "#61afef" }}>Sign In</h1>
      {errorMessage && (
        <p style={{ color: "#e06c75", fontWeight: "bold", maxWidth: "400px" }}>
          Error: {errorMessage}
        </p>
      )}
      <button
        onClick={() => signIn("google", { callbackUrl: callbackUrl })}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: "1.2em",
          backgroundColor: "#98c379",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Sign in with Google
      </button>
      <p style={{ color: "#c678dd" }}>Or sign in with other providers...</p>
    </div>
  );
}