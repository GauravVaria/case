// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { COLORS } from '@/styles/colors'; // Import color palette

import logo from '../../public/logo.png'; // Adjust this path if needed

export default function Header() {
  const { data: session, status } = useSession();
  const [windowWidth, setWindowWidth] = useState(0); // State to track window width

  useEffect(() => {
    // Client-side only code
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') { // Ensure window is defined (client-side)
      setWindowWidth(window.innerWidth); // Set initial width
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const isMobile = windowWidth < 768; // Define a breakpoint for mobile

  if (status === "loading") {
    return (
      <header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: COLORS.LIGHT_BACKGROUND,
          color: COLORS.DARK_TEXT,
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
        justifyContent: "space-between", // Use space-between for general layout
        alignItems: "center",
        padding: isMobile ? "0.5rem 1rem" : "1rem 2rem", // Smaller padding on mobile
        backgroundColor: COLORS.LIGHT_BACKGROUND,
        color: COLORS.DARK_TEXT,
        width: "100%",
        boxSizing: "border-box",
        flexWrap: 'wrap', // Allow items to wrap on small screens
      }}
    >
      {/* Left content (can be empty or title) - will grow to push logo center */}
      <div style={{ flex: 1, minWidth: '50px', textAlign: 'left' }}>
        {/* Placeholder for left-aligned content if needed */}
      </div>

      {/* Center Logo Container */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          src={logo}
          alt="V&V LAW ASSOCIATES Logo"
          width={isMobile ? 100 : 150} // Smaller logo on mobile
          height={isMobile ? 25 : 40} // Smaller logo on mobile
          priority
          style={{ objectFit: 'contain', margin: isMobile ? '0 auto' : '0' }} // Center on mobile if it's the main item, adjust margin
        />
      </div>

      {/* Right content - sign-in/out buttons */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minWidth: '100px' }}>
        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="User Profile"
                width={30} // Smaller image on mobile
                height={30} // Smaller image on mobile
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
                color: COLORS.LIGHT_TEXT,
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: isMobile ? "0.7em" : "0.9em", // Smaller font on mobile
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={{
              padding: isMobile ? "4px 8px" : "8px 15px", // Smaller padding on mobile
              backgroundColor: COLORS.PRIMARY_ACCENT,
              color: COLORS.LIGHT_TEXT,
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: isMobile ? "0.7em" : "0.9em", // Smaller font on mobile
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}