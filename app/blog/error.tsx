"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Blog Error Boundary]:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{ fontSize: "3rem" }}>📄</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)" }}>
        Failed to load content
      </h2>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "40ch", lineHeight: 1.6 }}>
        We couldn&apos;t load this content right now. Our CMS may be temporarily unavailable.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.625rem 1.25rem",
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
        <Link
          href="/blog"
          style={{
            padding: "0.625rem 1.25rem",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Browse all articles
        </Link>
      </div>
    </div>
  );
}
