"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import type { StrapiBlocksContent } from "@/lib/types";
import styles from "./TableOfContents.module.css";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: StrapiBlocksContent;
}

/**
 * Extract headings from Strapi Blocks JSON content.
 * Blocks heading nodes have shape: { type: "heading", level: 2, children: [{ text: "..." }] }
 */
function extractHeadingsFromBlocks(content: StrapiBlocksContent): TocItem[] {
  if (!Array.isArray(content)) return [];

  const headings: TocItem[] = [];

  for (const node of content) {
    if (node.type !== "heading") continue;
    const level = (node as { type: "heading"; level: number; children: Array<{ text: string }> }).level;
    if (level < 2 || level > 4) continue; // Only h2-h4 for a clean TOC

    const rawText = (node as { type: "heading"; level: number; children: Array<{ text: string }> }).children
      .map((c) => c.text ?? "")
      .join("");

    if (!rawText.trim()) continue;

    const id = rawText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    headings.push({ id, text: rawText.trim(), level });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadingsFromBlocks(content), [content]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <aside className={styles.toc} aria-label="Table of contents">
      <div className={styles.tocInner}>
        <p className={styles.tocTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          On this page
        </p>
        <nav aria-label="Table of contents navigation">
          <ol className={styles.tocList}>
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`${styles.tocItem} ${styles[`level${heading.level}`]}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={`${styles.tocLink} ${activeId === heading.id ? styles.tocLinkActive : ""}`}
                  onClick={(e) => handleClick(e, heading.id)}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
