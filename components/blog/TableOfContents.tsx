"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./TableOfContents.module.css";

interface TocItem {
  id: string;
  text: string;
  level: number;
  mainTitleIndex?: number;
  subtitleIndex?: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  
  if (content.includes('</h') || content.includes('<h')) {
    // HTML parsing — extract id from element if present, else generate from text
    const htmlRegex = /<h([2-4])([^>]*)>(.*?)<\/h\1>/gi;
    let match;
    while ((match = htmlRegex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const attrs = match[2];
      const rawText = match[3].replace(/<[^>]+>/g, '').trim(); // strip inner tags

      // Prefer existing id= attribute on the element
      const existingIdMatch = attrs.match(/id=["']([^"']+)["']/i);
      const id = existingIdMatch
        ? existingIdMatch[1]
        : rawText
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

      headings.push({ id, text: rawText, level });
    }
    // We don't return early here; we let it fall through to the numbering logic.
  } else {
    // Markdown parsing
    const lines = content.split("\n");

    for (const line of lines) {
      // Match ## Heading or ### Heading (h2 and h3 only for clean TOC)
      const match = line.match(/^(#{2,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*|__|\*|_|`/g, ""); // strip markdown formatting
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        headings.push({ id, text, level });
      }
    }
  }

  // Calculate numbers
  let mainIndex = 0;
  let subIndex = 0;
  let currentMainLevel = Math.min(...headings.map(h => h.level));

  return headings.map((heading) => {
    if (heading.level === currentMainLevel) {
      mainIndex++;
      subIndex = 0;
      return { ...heading, mainTitleIndex: mainIndex };
    } else {
      subIndex++;
      return { ...heading, mainTitleIndex: mainIndex, subtitleIndex: subIndex };
    }
  });
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
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
      // Update URL hash without scroll jump
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
        <nav>
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
                  <span className={styles.tocNumber}>
                    {heading.level === Math.min(...headings.map(h => h.level))
                      ? `${heading.mainTitleIndex}.0`
                      : `${heading.mainTitleIndex}.${heading.subtitleIndex}`}
                  </span>
                  <span className={styles.tocText}>
                    {heading.text.length > 35 ? heading.text.substring(0, 35) + '...' : heading.text}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
