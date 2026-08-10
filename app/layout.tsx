import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
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
