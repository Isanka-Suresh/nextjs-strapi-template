import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import type { CSSProperties } from 'react';
import Image from 'next/image';

interface BlocksContentRendererProps {
  content: BlocksContent;
  className?: string;
}

/**
 * Renders Strapi Blocks JSON (htmlContent field) using the official
 * @strapi/blocks-react-renderer package. Custom renderers apply
 * consistent prose styling, and heading blocks get slug IDs so the
 * TableOfContents component can observe them.
 */
export function BlocksContentRenderer({ content, className }: BlocksContentRendererProps) {
  return (
    <div className={className}>
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: ({ children }) => <p>{children}</p>,

          heading: ({ children, level }) => {
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            // Derive a slug id from the text content so ToC anchors resolve
            const text = Array.isArray(children)
              ? (children as any[]).map((c) => (typeof c === 'string' ? c : c?.props?.children ?? '')).join('')
              : String(children ?? '');
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');
            return <Tag id={id}>{children}</Tag>;
          },

          list: ({ children, format }) =>
            format === 'ordered' ? <ol>{children}</ol> : <ul>{children}</ul>,

          'list-item': ({ children }) => <li>{children}</li>,

          quote: ({ children }) => <blockquote>{children}</blockquote>,

          code: ({ children, plainText }) => (
            <pre>
              <code>{plainText ?? children}</code>
            </pre>
          ),

          image: ({ image }) => {
            if (!image?.url) return null;
            return (
              <figure>
                <Image
                  src={image.url}
                  alt={image.alternativeText ?? ''}
                  width={image.width ?? 800}
                  height={image.height ?? 450}
                  style={{ maxWidth: '100%', height: 'auto' } as CSSProperties}
                />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            );
          },
        }}
        modifiers={{
          bold: ({ children }) => <strong>{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <u>{children}</u>,
          strikethrough: ({ children }) => <s>{children}</s>,
          code: ({ children }) => <code>{children}</code>,
        }}
      />
    </div>
  );
}
