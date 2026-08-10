"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[Error Boundary] Unhandled error:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{ fontSize: "4rem" }}>😕</div>
      <h2
        style={{
          fontSize: "1.875rem",
          fontWeight: 700,
          color: "var(--color-text)",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          color: "var(--color-text-secondary)",
          maxWidth: "40ch",
          lineHeight: 1.6,
        }}
      >
        We hit an unexpected error. This has been logged. Please try again or
        return to the home page.
      </p>
      {error.digest && (
        <code
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            background: "var(--color-bg-tertiary)",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
          }}
        >
          Error ID: {error.digest}
        </code>
      )}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
