"use client";

import { useState } from "react";
import styles from "./NewsletterForm.module.css";

type SubscribeStatus = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email,
          subject: "Newsletter",
          message: `Newsletter subscription request from ${email}.`,
        }),
      });

      if (!res.ok) throw new Error("Subscription failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.successState} role="status" aria-live="polite">
        <span className={styles.successIcon}>✅</span>
        <p className={styles.successText}>
          You&apos;re subscribed! We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={styles.input}
        required
        aria-label="Email address"
        id="newsletter-email"
        disabled={status === "loading"}
      />
      <button
        type="submit"
        className={styles.btn}
        id="newsletter-submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className={styles.errorText} role="alert">{errorMsg}</p>
      )}
    </form>
  );
}
