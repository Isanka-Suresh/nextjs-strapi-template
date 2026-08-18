"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      // Use the article element if available, else fall back to document body
      const article =
        document.getElementById("article-body") || document.documentElement;
      const articleHeight = article.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const pct =
        articleHeight > 0
          ? Math.min(100, Math.max(0, (scrolled / articleHeight) * 100))
          : 0;
      bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: "0%",
        background: "#F5A623",
        zIndex: 9999,
        transition: "width 0.1s linear",
        pointerEvents: "none",
      }}
    />
  );
}
