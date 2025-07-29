// src/components/SessionProviderWrapper.tsx
"use client"; // This is a client component

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react"; // For children prop type

export default function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}