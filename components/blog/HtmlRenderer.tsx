"use client";

interface HtmlRendererProps {
  html?: string;
  content?: string;
  className?: string;
}

/**
 * Renders raw HTML stored in Strapi's htmlContent field.
 * The HTML is pre-sanitized at import time (Cheerio strips scripts/styles).
 * We use dangerouslySetInnerHTML because the content is trusted CMS-controlled HTML.
 */
export function HtmlRenderer({ html, content, className }: HtmlRendererProps) {
  const rawHtml = html ?? content ?? "";
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
}
