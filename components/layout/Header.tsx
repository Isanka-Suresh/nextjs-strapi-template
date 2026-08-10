"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} ref={menuRef}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              {/* Graduation cap symbol */}
              <polygon points="14,7 24,12 14,17 4,12" fill="white" opacity="0.95" />
              <line x1="14" y1="17" x2="14" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="24" y1="12" x2="24" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.logoText}>
            Edu<span className={styles.logoPulse}>Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href))
                  ? styles.navLinkActive
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/blog" className={styles.writeCta}>
            Start Reading
          </Link>

          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            id="theme-toggle"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            id="mobile-menu-toggle"
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`}>
        <nav className={styles.mobileNav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileNavLink} ${
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href))
                  ? styles.mobileNavLinkActive
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/blog" className={styles.mobileCtaLink}>
            Start Reading →
          </Link>
        </nav>
      </div>
    </header>
  );
}
