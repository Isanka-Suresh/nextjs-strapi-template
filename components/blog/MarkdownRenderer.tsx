"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Slugify a heading text for consistent anchor IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const components: Components = {
  h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
  h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
  h4: ({ children }) => <h4 id={slugify(String(children))}>{children}</h4>,
  // Open external links in new tab safely
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http");
    const text = String(children);
    
    // Apply CTA styles for specific link texts
    if (text === "WhatsApp Us") {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="ctaButtonPrimary">
          {children}
        </a>
      );
    }
    if (text === "Book a Free Consultation") {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="ctaButtonSecondary">
          {children}
        </a>
      );
    }
    if (text.startsWith("Enquire About")) {
      return (
        <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className="ctaHeadingLink">
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  // Render images with responsive sizing, but hide the hardcoded author image
  img: ({ src, alt }) => {
    if (alt?.includes("Education Consultant") || src?.includes("author")) {
      return null; // Hide hardcoded author images since page.tsx renders the Author Card
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} style={{ maxWidth: "100%", height: "auto", borderRadius: "12px", margin: "32px 0" }} loading="lazy" />
    );
  },
  p: ({ children }) => {
    const text = String(children);
    
    // Hide known hardcoded author text
    if (
      text.includes("Jackline Wahu") || 
      text.includes("Education Consultant, Studies in Malaysia") || 
      text.includes("Jackline advises international students") ||
      text.includes("This guide is for general information. It does not guarantee admission") ||
      text.includes("NEXT ->") || 
      text.includes("NEXT \u2192")
    ) {
      return null;
    }
    
    return <p>{children}</p>;
  }
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
