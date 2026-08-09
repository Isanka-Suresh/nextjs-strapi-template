"use client";

import styles from "./NewsletterForm.module.css";

export function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: integrate with email provider (ConvertKit, Mailchimp, etc.)
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    if (email) {
      alert(`Thanks for subscribing with ${email}! (Demo)`);
      form.reset();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        className={styles.input}
        required
        aria-label="Email address"
        id="newsletter-email"
      />
      <button type="submit" className={styles.btn} id="newsletter-submit">
        Subscribe
      </button>
    </form>
  );
}
