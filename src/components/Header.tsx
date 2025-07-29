// src/components/Header.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { COLORS } from '@/styles/colors'; // Import color palette

// Import your logo image (assuming it's in public folder)
import logo from '../../public/logo.png'; // Adjust this path if needed

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: COLORS.LIGHT_BACKGROUND, // Changed to LIGHT_BACKGROUND
          color: COLORS.DARK_TEXT, // Changed to DARK_TEXT for visibility
          position: 'relative',
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
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: COLORS.LIGHT_BACKGROUND, // Changed to LIGHT_BACKGROUND
        color: COLORS.DARK_TEXT, // Changed to DARK_TEXT for visibility
        width: "100%",
        boxSizing: "border-box",
        position: 'relative',
      }}
    >
      <Image
        src={logo}
        alt="V&V LAW ASSOCIATES Logo"
        width={150} // Adjust width as needed
        height={40} // Adjust height as needed
        priority
        style={{ objectFit: 'contain' }}
      />

      <div
        style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {session ? (
          <>
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="User Profile"
                width={40}
                height={40}
                style={{ borderRadius: "50%", cursor: "pointer", border: `2px solid ${COLORS.PRIMARY_ACCENT}` }}
                title={`Signed in as ${session.user.name || session.user.email}`}
                onClick={() => signOut()}
              />
            )}
            <button
              onClick={() => signOut()}
              style={{
                padding: "8px 15px",
                backgroundColor: COLORS.DANGER,
                color: COLORS.LIGHT_TEXT, // Keep light text on danger button
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9em",
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "8px 15px",
              backgroundColor: COLORS.PRIMARY_ACCENT, // Changed to Primary Accent for sign in on light background
              color: COLORS.LIGHT_TEXT, // Keep light text on accent button
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "0.9em",
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}