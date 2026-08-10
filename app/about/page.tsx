import type { Metadata } from "next";
import styles from "./page.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about EduHub — a modern education blog covering online learning, study techniques, courses, and knowledge resources.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EduHub",
  url: SITE_URL,
  description: "A modern education blog covering online learning, study techniques, courses, and knowledge resources.",
  publisher: {
    "@type": "Organization",
    name: "EduHub",
    url: SITE_URL,
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className="container">
            <span className={styles.eyebrow}>About us</span>
            <h1 className={styles.title}>Built by educators,<br />for learners</h1>
            <p className={styles.subtitle}>
              EduHub is a modern blog dedicated to helping learners stay sharp, discover new
              skills, and keep up with the ever-evolving world of education and e-learning.
            </p>
          </div>
        </div>

        <div className="container--blog">
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Mission</h2>
              <p>
                We believe that great content is the backbone of lifelong learning. Our mission is
                to publish high-quality, practical articles that you can apply immediately — no
                fluff, no filler.
              </p>
              <p>
                From deep-dives into online learning platforms to beginner-friendly guides on
                study techniques, EduHub covers the full spectrum of modern education.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What We Cover</h2>
              <div className={styles.topicGrid}>
                {[
                  { emoji: "📚", label: "Online Learning" },
                  { emoji: "🧠", label: "Study Techniques" },
                  { emoji: "🎓", label: "Courses & Certifications" },
                  { emoji: "🚀", label: "Career Development" },
                  { emoji: "🔧", label: "Learning Tools" },
                  { emoji: "📐", label: "Educational Technology" },
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
                Are you an educator or learner with a story to tell or expertise to share? We&apos;re
                always looking for passionate contributors. Reach out via our{" "}
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
    </>
  );
}
