// src/app/layout.tsx
import "./globals.css"; // Your global styles
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Set body background to black */}
      <body style={{ margin: 0, padding: 0}}>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}