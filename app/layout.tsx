import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// ─────────────────────────────────────────────
// Self-hosted fonts via next/font (zero external requests,
// no render-blocking, no layout shift, GDPR-friendly)
// ─────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | EduHub",
    default: "EduHub — Insights for Lifelong Learners",
  },
  description:
    "EduHub is a modern education blog covering online learning, study techniques, courses, and knowledge resources. Written by educators, for learners.",
  keywords: ["education", "learning", "online courses", "study tips", "knowledge", "e-learning"],
  authors: [{ name: "EduHub Team" }],
  openGraph: {
    type: "website",
    siteName: "EduHub",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@EduHub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${firaCode.variable}`}
    >
      {/*
        Blocking inline script to set theme BEFORE first paint.
        This prevents FOUC without needing the 'mounted' state guard
        in ThemeProvider. Must be render-blocking (no defer/async).
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored || (prefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="page-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
