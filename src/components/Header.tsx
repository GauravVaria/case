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
          backgroundColor: COLORS.PRIMARY_DARK,
          color: COLORS.LIGHT_TEXT,
          position: 'relative', // Needed for absolute positioning of right content
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
        justifyContent: "center", // This centers the direct children horizontally
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: COLORS.PRIMARY_DARK,
        color: COLORS.LIGHT_TEXT,
        width: "100%",
        boxSizing: "border-box",
        position: 'relative', // Set header to relative for absolute positioning of right content
      }}
    >
      {/* Logo (This will now be truly centered by 'justifyContent: center' on the header) */}
      <Image
        src={logo}
        alt="V&V LAW ASSOCIATES Logo"
        width={150} // Adjust width as needed
        height={40} // Adjust height as needed
        priority
        style={{ objectFit: 'contain' }}
      />

      {/* Sign-in/out buttons (Absolute positioned to the right) */}
      <div
        style={{
          position: 'absolute', // Absolute positioning
          right: '2rem', // Matches header's right padding
          top: '50%', // Vertically center
          transform: 'translateY(-50%)', // Adjust for vertical centering
          display: 'flex', // Use flex for internal layout of buttons/image
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
                color: COLORS.LIGHT_TEXT,
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
              backgroundColor: COLORS.SECONDARY_ACCENT,
              color: COLORS.LIGHT_TEXT,
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