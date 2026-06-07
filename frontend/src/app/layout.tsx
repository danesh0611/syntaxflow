import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SyntaxFlow | Tech Insights & Tutorials",
  description: "Sleek developer insights, code walkthroughs, and technical tutorials.",
  keywords: ["programming", "nextjs", "react", "typescript", "coding", "software engineering", "tech tutorials", "web development", "system architecture"],
  authors: [{ name: "SyntaxFlow Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "SyntaxFlow | Tech Insights & Tutorials",
    description: "Sleek developer insights, code walkthroughs, and technical tutorials.",
    url: "https://syntaxflow.dev",
    siteName: "SyntaxFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyntaxFlow | Tech Insights & Tutorials",
    description: "Sleek developer insights, code walkthroughs, and technical tutorials.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
