// src/app/page.tsx
"use client"; // This is a client component

import { useSession, signIn, signOut } from "next-auth/react";
// import Image from "next/image"; // Uncomment if you want to use Next.js Image component

export default function HomePage() {
  const { data: session, status } = useSession(); // 'data' is the session object, 'status' indicates loading/authenticated/unauthenticated

  if (status === "loading") {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <p>Loading session data...</p>
      </div>
    );
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
        fontFamily: "sans-serif",
        backgroundColor: "#282c34",
        color: "#abb2bf",
      }}
    >
      {session ? (
        <>
          <h1 style={{ color: "#61afef" }}>Hello, {session.user?.name}!</h1>
          <p>Email: {session.user?.email}</p>
          {session.user?.image && (
            // Using a regular img tag for simplicity. Use Next.js Image for optimization.
            <img
              src={session.user.image}
              alt="User Profile"
              style={{ borderRadius: "50%", width: "80px", height: "80px" }}
              referrerPolicy="no-referrer" // Helps prevent broken images from some CDN configurations
            />
            /*
            <Image
              src={session.user.image}
              alt="User Profile"
              width={80}
              height={80}
              style={{ borderRadius: "50%" }}
            />
            */
          )}
          <button
            onClick={() => signOut()}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "1em",
              backgroundColor: "#e06c75",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <h1 style={{ color: "#98c379" }}>Welcome! Please Sign In.</h1>
          <button
            onClick={() => signIn("google")} // Redirects to our custom sign-in page, then to Google
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "1.2em",
              backgroundColor: "#61afef",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
}