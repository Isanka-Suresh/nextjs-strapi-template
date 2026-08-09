import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 — Page Not Found" };

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      padding: "var(--space-2xl)",
      gap: "var(--space-lg)",
    }}>
      <span style={{ fontSize: "6rem" }}>🔍</span>
      <h1 style={{
        fontSize: "clamp(2rem, 5vw, 3rem)",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        color: "var(--color-text)",
      }}>
        Page not found
      </h1>
      <p style={{
        fontSize: "var(--text-lg)",
        color: "var(--color-text-secondary)",
        maxWidth: "400px",
        lineHeight: 1.7,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "var(--space-md)" }}>
        <Link href="/" style={{
          padding: "0.75rem 1.5rem",
          fontWeight: 700,
          color: "white",
          background: "var(--gradient-primary)",
          borderRadius: "var(--radius-full)",
          fontSize: "var(--text-sm)",
        }}>
          Go Home
        </Link>
        <Link href="/blog" style={{
          padding: "0.75rem 1.5rem",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-full)",
          fontSize: "var(--text-sm)",
        }}>
          Browse Blog
        </Link>
      </div>
    </div>
  );
}
