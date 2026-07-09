import type { Metadata } from "next";
import { Geist_Mono, Martian_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Saurow",
  description: "~@sauroww(X) @saur0w(GitHub)",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${geistMono.variable} ${martianMono.variable}`}>
      <body>{children}</body>
      </html>
  );
}