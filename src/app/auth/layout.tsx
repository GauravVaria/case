// src/app/auth/layout.tsx
import React, { Suspense } from 'react'; // Import Suspense
import { ReactNode } from 'react'; // For children type

// This layout component can be a Server Component (default)
// It doesn't need "use client" because it's only importing React.

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* This Suspense boundary will catch the useSearchParams error during prerendering */}
      {/* A simple div with text is used as fallback. You can create a spinner/loader component. */}
      <Suspense fallback={<div>Loading authentication...</div>}>
        {children}
      </Suspense>
    </section>
  );
}