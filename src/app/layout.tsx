// src/app/layout.tsx
import "./globals.css"; // Your global styles
import SessionProviderWrapper from "../components/SessionProviderWrapper"; // Import the wrapper
import { ReactNode } from "react"; // For children prop type

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap your content with the SessionProviderWrapper */}
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}