import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { getBaseUrl } from "@/lib/utils";
import ChatAssistant from "@/components/ChatAssistant";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
  metadataBase: new URL(getBaseUrl()),
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
  verification: {
    google: [
      "C4iB6CbG_q5hRMd0VkPlhScF1MY5KFB-BthH5J-AS7E",
      "T8obucIjYrueTKBWLXFoJzGp9ChKYxaoRzWWsnQwdOg",
    ],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SyntaxFlow',
  url: 'https://syntaxflowarticles.pages.dev',
  description: 'Sleek developer insights, code walkthroughs, DSA solutions, and technical tutorials.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://syntaxflowarticles.pages.dev/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SyntaxFlow',
  url: 'https://syntaxflowarticles.pages.dev',
  logo: 'https://syntaxflowarticles.pages.dev/favicon.ico',
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZGD1G5MY9S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZGD1G5MY9S');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x3qq8di3kd");
          `}
        </Script>
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}
