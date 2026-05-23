import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "MM26 — Tennis & Padel Tournaments",
  description: "Organize and join tournaments for racket sports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ink">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
