import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expert Advise - Your Personal Advisory Board",
  description: "Chat with Elon Musk, Sam Altman, and Dario Amodei - Your AI advisory board",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
