import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Placecard Generator",
  description: "Browser-first folded tent-card PDF generator for print brokers"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
