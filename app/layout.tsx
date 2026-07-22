import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const deploymentUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const metadataBase = new URL(
  deploymentUrl ? `https://${deploymentUrl}` : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Hugie Connect",
    template: "%s | Hugie Connect",
  },
  description:
    "A modern community management platform for memberships, events, ticketing, access control, and administration.",
  applicationName: "Hugie Connect",
  openGraph: {
    type: "website",
    siteName: "Hugie Connect",
    title: "Hugie Connect",
    description:
      "Memberships, events and community access in one secure platform.",
    images: ["/images/hugie-connect-community-hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hugie Connect",
    description:
      "Memberships, events and community access in one secure platform.",
    images: ["/images/hugie-connect-community-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
