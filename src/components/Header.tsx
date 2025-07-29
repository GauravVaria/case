// src/components/Header.tsx
"use client"; // This is a client component

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image"; // For Next.js Image component, provides optimization

export default function Header() {
  const { data: session, status } = useSession();

  // Show loading state if session is still being fetched
  if (status === "loading") {
    return (
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#333",
          color: "white",
        }}
      >
        <p>Loading...</p>
      </header>
    );
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end", // Push content to the right
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "#333",
        color: "white",
        width: "100%", // Ensure header takes full width
        boxSizing: "border-box", // Include padding in width
      }}
    >
      {session ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="User Profile"
              width={40} // Specify width
              height={40} // Specify height
              style={{ borderRadius: "50%", cursor: "pointer" }}
              title={`Signed in as ${session.user.name || session.user.email}`}
              onClick={() => signOut()} // Click image to sign out
            />
          )}
          {/* Optional: Show user name, removed for brevity based on request */}
          {/* <span style={{ marginRight: '10px' }}>{session.user?.name || session.user?.email}</span> */}
          <button
            onClick={() => signOut()}
            style={{
              padding: "8px 15px",
              backgroundColor: "#dc3545", // Red for sign out
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "0.9em",
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          style={{
            padding: "8px 15px",
            backgroundColor: "#007bff", // Blue for sign in
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "0.9em",
          }}
        >
          Sign In
        </button>
      )}
    </header>
  );
}