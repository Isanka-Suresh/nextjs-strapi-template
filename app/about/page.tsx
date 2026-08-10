import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about DevPulse — a modern blog for developers covering web development, JavaScript, design, and tooling.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>About us</span>
          <h1 className={styles.title}>Built by developers,<br />for developers</h1>
          <p className={styles.subtitle}>
            DevPulse is a modern blog dedicated to helping developers stay sharp, learn new
            skills, and keep up with the ever-evolving world of web development.
          </p>
        </div>
      </div>

      <div className="container--blog">
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <p>
              We believe that great content is the backbone of developer growth. Our mission is
              to publish high-quality, practical articles that you can apply immediately — no
              fluff, no filler.
            </p>
            <p>
              From deep-dives into browser internals to beginner-friendly tutorials on modern
              frameworks, DevPulse covers the spectrum of modern web development.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What We Cover</h2>
            <div className={styles.topicGrid}>
              {[
                { emoji: "⚡", label: "Web Performance" },
                { emoji: "🎨", label: "Design Systems" },
                { emoji: "🔧", label: "Developer Tools" },
                { emoji: "🚀", label: "Modern Frameworks" },
                { emoji: "🔐", label: "Security" },
                { emoji: "📐", label: "Architecture" },
              ].map((t) => (
                <div key={t.label} className={styles.topicCard}>
                  <span className={styles.topicEmoji}>{t.emoji}</span>
                  <span className={styles.topicLabel}>{t.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Write for Us</h2>
            <p>
              Are you a developer with a story to tell or expertise to share? We&apos;re always
              looking for passionate contributors. Reach out via our{" "}
              <a href="/contact" className={styles.link}>contact page</a>.
            </p>
          </section>

          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Ready to dive in?</h3>
            <p className={styles.ctaDesc}>Explore our latest articles and find something worth reading.</p>
            <a href="/blog" className={styles.ctaBtn}>Browse the Blog →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
