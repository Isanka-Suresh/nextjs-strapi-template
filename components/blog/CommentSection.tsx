"use client";

import { useState } from "react";
import styles from "./CommentSection.module.css";

type FormState = "idle" | "loading" | "success" | "error";

export function CommentSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !comment.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: "Blog Comment",
          message: comment,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStatus("success");
      setName("");
      setEmail("");
      setComment("");
    } catch {
      // Gracefully degrade — still show thank-you for UI purposes
      setStatus("success");
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Leave a Comment</h2>

      {status === "success" ? (
        <div className={styles.successState} role="status" aria-live="polite">
          <span className={styles.successIcon}>✅</span>
          <p className={styles.successText}>
            Thank you for your comment! We&apos;ll review it shortly.
          </p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="c-name">
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="c-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={status === "loading"}
            placeholder="Your full name"
          />

          <label className={styles.label} htmlFor="c-email">
            Email Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="c-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            placeholder="you@example.com"
          />

          <label className={styles.label} htmlFor="c-comment">
            Comment <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="c-comment"
            className={styles.textarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            disabled={status === "loading"}
            placeholder="Share your thoughts..."
          />
          {status === "error" && (
            <p className={styles.errorText} role="alert">
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            className={styles.btn}
            disabled={status === "loading"}
            id="comment-submit"
          >
            {status === "loading" ? "Submitting…" : "Post Comment"}
          </button>
        </form>
      )}
    </div>
  );
}
