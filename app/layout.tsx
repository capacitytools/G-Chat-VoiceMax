import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G-Chat Voice Max",
  description: "AI Audio Studio for Creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}