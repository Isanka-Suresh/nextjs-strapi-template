// Server Component — no "use client" directive.
// This renders Strapi Blocks rich-text content on the server,
// eliminating the react-markdown client bundle (~50KB saved).
//
// Strapi Blocks format is JSON (not markdown strings).
// The @strapi/blocks-react-renderer package handles the rendering.

import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import type { StrapiBlocksContent } from "@/lib/types";
import Image from "next/image";
import { getStrapiImageUrl } from "@/lib/strapi";

interface BlocksRendererProps {
  content: StrapiBlocksContent;
  className?: string;
}

export function MarkdownRenderer({ content, className }: BlocksRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <BlocksRenderer
        content={content}
        blocks={{
          // Override image rendering to use next/image for optimization
          image: ({ image }) => {
            const src = getStrapiImageUrl(image.url);
            if (!src) return null;
            return (
              <figure className="blocks-image">
                <Image
                  src={src}
                  alt={image.alternativeText ?? ""}
                  width={image.width ?? 800}
                  height={image.height ?? 450}
                  className="blocks-image__img"
                  sizes="(max-width: 720px) 100vw, 720px"
                  loading="lazy"
                />
                {image.caption && (
                  <figcaption className="blocks-image__caption">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            );
          },
          // Open external links in new tab safely
          link: ({ children, url }) => {
            const isExternal = url.startsWith("http");
            return (
              <a
                href={url}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      />
    </div>
  );
}
