import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | DevPulse Blog",
    default: "DevPulse Blog — Insights for Modern Developers",
  },
  description:
    "DevPulse is a modern blog covering web development, programming, design, and developer culture. Written by developers, for developers.",
  keywords: ["web development", "programming", "blog", "JavaScript", "Next.js", "React"],
  authors: [{ name: "DevPulse Team" }],
  openGraph: {
    type: "website",
    siteName: "DevPulse Blog",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="page-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <style>{`
          .page-wrapper {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .main-content {
            flex: 1;
            padding-top: var(--header-height);
          }
        `}</style>
      </body>
    </html>
  );
}
