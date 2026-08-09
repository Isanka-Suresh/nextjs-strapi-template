import Link from "next/link";
import styles from "./Footer.module.css";

const FOOTER_LINKS = {
  Navigation: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Topics: [
    { href: "/category/web-development", label: "Web Development" },
    { href: "/category/javascript", label: "JavaScript" },
    { href: "/category/design", label: "Design" },
    { href: "/category/tooling", label: "Tooling" },
  ],
  Legal: [
    { href: "/sitemap.xml", label: "Sitemap" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* Top section */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <rect width="28" height="28" rx="8" fill="url(#footerLogoGrad)" />
                <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className={styles.logoText}>
                Dev<span className={styles.logoPulse}>Pulse</span>
              </span>
            </Link>
            <p className={styles.tagline}>
              Insights, tutorials, and perspectives for modern developers. Written with ❤️ by developers.
            </p>
            {/* Social Links */}
            <div className={styles.socials}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="/sitemap.xml"
                className={styles.socialLink}
                aria-label="RSS Feed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className={styles.links}>
            {Object.entries(FOOTER_LINKS).map(([title, items]) => (
              <div key={title} className={styles.linkCol}>
                <h3 className={styles.colTitle}>{title}</h3>
                <ul className={styles.linkList}>
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.footerLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} DevPulse Blog. Built with{" "}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className={styles.techLink}>
              Next.js
            </a>{" "}
            &{" "}
            <a href="https://strapi.io" target="_blank" rel="noopener noreferrer" className={styles.techLink}>
              Strapi
            </a>
          </p>
          <p className={styles.madeWith}>Made with ❤️ for developers</p>
        </div>
      </div>
    </footer>
  );
}
