import type { ReactNode } from "react";

import { AppShell } from "../components/AppShell";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
