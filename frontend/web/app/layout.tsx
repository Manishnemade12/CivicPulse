import type { ReactNode } from "react";

import { AppHeader } from "../components/AppHeader";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
