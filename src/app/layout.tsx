import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { getConfig } from "@/config/wagmi";

import { ProvidersShell } from "./providers-loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAZA Mining App",
  description:
    "Mine and claim $BAZA on Base with streak check-ins — Base Smart Wallet and MetaMask supported.",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "base:app_id": "69861ce98dcaa0daf5755fcc",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(getConfig(), cookieHeader);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ProvidersShell initialState={initialState}>
          {children}
        </ProvidersShell>
      </body>
    </html>
  );
}
// redeploy
