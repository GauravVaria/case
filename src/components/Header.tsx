// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { COLORS } from '@/styles/colors'; // Import color palette

// Import your logo image (assuming it's in public folder)
import logo from '../../public/logo.png'; // Adjust this path if needed

export default function Header() {
  const { data: session, status } = useSession();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const isMobile = windowWidth < 768;

  if (status === "loading") {
    return (
      <header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          color: COLORS.LIGHT_TEXT,
          position: 'relative',
          boxShadow: `0 2px 8px ${COLORS.SHADOW_DARK}`, // Added box shadow
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
        padding: isMobile ? "0.5rem 1rem" : "1rem 2rem", // Smaller padding on mobile
        backgroundColor: '#f8f5f0', // Header background to black
        color: COLORS.LIGHT_TEXT, // Text color for visibility on black
        width: "100%",
        boxSizing: "border-box",
        position: 'relative',
        boxShadow: `0 2px 8px ${COLORS.SHADOW_DARK}`, // Added box shadow
      }}
    >
      {/* Logo */}
      <Image
        src={logo}
        alt="V&V LAW ASSOCIATES Logo"
        width={isMobile ? 100 : 150} // Smaller logo on mobile
        height={isMobile ? 25 : 40} // Smaller logo on mobile
        priority
        style={{ objectFit: 'contain' }}
      />

      {/* Sign-in/out buttons */}
      <div
        style={{
          position: 'absolute',
          right: isMobile ? '1rem' : '2rem', // Adjust right spacing for mobile
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
                width={isMobile ? 30 : 40} // Smaller image on mobile
                height={isMobile ? 30 : 40} // Smaller image on mobile
                style={{ borderRadius: "50%", cursor: "pointer", border: `2px solid ${COLORS.PRIMARY_ACCENT}` }}
                title={`Signed in as ${session.user.name || session.user.email}`}
                onClick={() => signOut()}
              />
            )}
            <button
              onClick={() => signOut()}
              style={{
                padding: isMobile ? "4px 8px" : "8px 15px", // Smaller padding on mobile
                backgroundColor: COLORS.DANGER,
                color: COLORS.LIGHT_TEXT, // Keep light text on danger button
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: isMobile ? "0.7em" : "0.9em", // Smaller font on mobile
                boxShadow: `0 1px 3px ${COLORS.SHADOW_COLOR}`, // Added box shadow
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={{
              padding: isMobile ? "4px 8px" : "8px 15px", // Smaller padding on mobile
              backgroundColor: COLORS.PRIMARY_ACCENT, // Primary Accent for sign in on black background
              color: COLORS.LIGHT_TEXT, // Keep light text on accent button
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: isMobile ? "0.7em" : "0.9em", // Smaller font on mobile
              boxShadow: `0 1px 3px ${COLORS.SHADOW_COLOR}`, // Added box shadow
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}