import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expert Advise - Your Personal Advisory Board",
  description: "Get advice from Nikhil Kamath, Kunal Shah, and Ritesh Agarwal",
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
