"use client";

import { useState } from "react";
import type { Metadata } from "next";
import styles from "./page.module.css";

// Note: metadata export won't work in client component — we handle this in a server wrapper
// Contact form itself is client-side

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Get in touch</span>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have a question, want to contribute, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact Info */}
          <div className={styles.info}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <h3 className={styles.infoTitle}>Email us</h3>
              <p className={styles.infoDesc}>
                Reach us at <a href="mailto:hello@devpulse.blog" className={styles.infoLink}>hello@devpulse.blog</a>
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✍️</div>
              <h3 className={styles.infoTitle}>Write for us</h3>
              <p className={styles.infoDesc}>Interested in contributing? Tell us your topic idea.</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🐛</div>
              <h3 className={styles.infoTitle}>Report an issue</h3>
              <p className={styles.infoDesc}>Found a bug or broken link? Let us know!</p>
            </div>
          </div>

          {/* Form */}
          <div className={styles.formWrapper}>
            {status === "success" ? (
              <div className={styles.success}>
                <span className={styles.successIcon}>✅</span>
                <h2 className={styles.successTitle}>Message sent!</h2>
                <p className={styles.successDesc}>
                  Thanks for reaching out. We&apos;ll get back to you shortly.
                </p>
                <button className={styles.resetBtn} onClick={() => setStatus("idle")}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="contact-name" className={styles.label}>Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className={styles.input}
                      disabled={status === "loading"}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="contact-email" className={styles.label}>Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className={styles.input}
                      disabled={status === "loading"}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-subject" className={styles.label}>Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className={styles.input}
                    disabled={status === "loading"}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-message" className={styles.label}>Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                    rows={6}
                    className={styles.textarea}
                    disabled={status === "loading"}
                  />
                </div>
                {error && <p className={styles.errorMsg}>{error}</p>}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === "loading"}
                  id="contact-submit"
                >
                  {status === "loading" ? (
                    <span className={styles.loadingDot}>Sending...</span>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
