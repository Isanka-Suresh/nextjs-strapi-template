import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  getPostBySlug,
  getAllPostSlugs,
  getRelatedPosts,
  getAdjacentPosts,
  getStrapiImageUrl,
} from "@/lib/strapi";
import { BlocksContentRenderer } from "@/components/blog/BlocksContentRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { LiveRefresh } from "@/components/blog/LiveRefresh";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { CommentSection } from "@/components/blog/CommentSection";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post not found" };
    const imageUrl = getStrapiImageUrl(post.coverImage?.url);
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.title,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.title,
        type: "article",
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: post.author ? [post.author.name] : [],
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.title,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export const revalidate = 60;
export const dynamicParams = true;

/** Estimate reading time from Strapi Blocks JSON content */
function calcReadTime(content: any): number {
  if (!content) return 1;
  // Extract text from all blocks
  const text = Array.isArray(content)
    ? content
        .map((block: any) =>
          (block.children ?? [])
            .map((c: any) => c.text ?? '')
            .join(' ')
        )
        .join(' ')
    : String(content);
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const [relatedPosts, adjacent] = await Promise.allSettled([
    post.category ? getRelatedPosts(post.category.slug, slug) : Promise.resolve([]),
    getAdjacentPosts(post.publishedAt, slug),
  ]);

  const relatedPostsList = relatedPosts.status === "fulfilled" ? relatedPosts.value : [];
  const adjacentPosts = adjacent.status === "fulfilled" ? adjacent.value : { prev: null, next: null };

  const imageUrl = getStrapiImageUrl(post.coverImage?.url);
  const authorAvatarUrl = getStrapiImageUrl(post.author?.avatar?.url);

  // contentBlocks is Strapi Blocks JSON — typed as BlocksContent
  const contentBlocks = post.contentBlocks;
  const readTime = post.readingTime || calcReadTime(contentBlocks);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.title,
    image: imageUrl || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Reading progress bar */}
      <ReadingProgress />

      <LiveRefresh slug={post.slug} initialUpdatedAt={post.updatedAt} />

      <article id="article-body">
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className="container">
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/blog" className={styles.breadcrumbLink}>Blogs</Link>
              {post.category && (
                <>
                  <span className={styles.breadcrumbSep}>/</span>
                  <Link href={`/category/${post.category.slug}`} className={styles.breadcrumbLink}>
                    {post.category.name}
                  </Link>
                </>
              )}
            </nav>

            {/* Cover Image (16/7 aspect ratio, matches reference HTML) */}
            <div className={styles.heroCoverWrapper}>
              <div className={styles.heroCoverInner}>
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={post.coverImage?.alternativeText || post.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1180px"
                    className={styles.heroCoverImage}
                  />
                )}
              </div>
            </div>

            {/* Title block */}
            <div className={styles.titleBlock}>
              {/* Category chip */}
              {post.category && (
                <Link
                  href={`/category/${post.category.slug}`}
                  className={styles.categoryBadge}
                >
                  {post.category.name}
                </Link>
              )}

              <h1 className={styles.title}>{post.title}</h1>

              {/* Meta row: date · author · read time */}
              <div className={styles.meta}>
                <time dateTime={post.publishedAt} className={styles.date}>
                  {format(new Date(post.publishedAt), "yyyy MMMM d")}
                </time>
                {post.author && (
                  <>
                    <span className={styles.metaSep}>&middot;</span>
                    <span>By {post.author.name}</span>
                  </>
                )}
                <span className={styles.metaSep}>&middot;</span>
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout: article LEFT, sidebar RIGHT ── */}
        <div className="wrap">
          <div className={styles.articleLayout}>

            {/* ── Article Main (LEFT) ── */}
            <div className={styles.articleMain}>
              <div className={styles.content}>
                {/* Render Strapi Blocks JSON via BlocksContentRenderer */}
                {contentBlocks && (
                  <BlocksContentRenderer content={contentBlocks} className={styles.prose} />
                )}
              </div>

              {/* ── Share ── */}
              <div className={styles.shareSection}>
                <span className={styles.shareLabel}>Share this article</span>
                <div className={styles.shareButtons}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                    aria-label="Share on X (Twitter)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                    aria-label="Share on LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* ── Author Card ── */}
              {post.author && (
                <div className={styles.authorCard}>
                  {authorAvatarUrl ? (
                    <Image
                      src={authorAvatarUrl}
                      alt={post.author.name}
                      width={64}
                      height={64}
                      className={styles.authorCardAvatar}
                    />
                  ) : (
                    <span className={styles.authorCardInitial}>{post.author.name.charAt(0)}</span>
                  )}
                  <div className={styles.authorCardInfo}>
                    <Link href={`/author/${post.author.slug}`} className={styles.authorCardName}>
                      {post.author.name}
                    </Link>
                    <p className={styles.authorCardLabel}>Education Consultant, Studies in Malaysia</p>
                    {post.author.bio && (
                      <p className={styles.authorCardBio}>{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Prev / Next ── */}
              {(adjacentPosts.prev || adjacentPosts.next) && (
                <div className={styles.prevNext}>
                  {adjacentPosts.prev ? (
                    <Link href={`/blog/${adjacentPosts.prev.slug}`} className={styles.prevNextLink}>
                      &larr; PREV: {adjacentPosts.prev.title}
                    </Link>
                  ) : <span />}
                  {adjacentPosts.next ? (
                    <Link href={`/blog/${adjacentPosts.next.slug}`} className={styles.prevNextLink}>
                      NEXT: {adjacentPosts.next.title} &rarr;
                    </Link>
                  ) : <span />}
                </div>
              )}

              {/* ── Comment Section ── */}
              <CommentSection />
            </div>

            {/* ── Sidebar (RIGHT) ── */}
            <aside className={styles.sidebar}>
              {/* TOC — generated from Blocks JSON headings */}
              {contentBlocks && (
                <div className={styles.sidebarWidget}>
                  <p className={styles.sidebarWidgetTitle}>Table of Contents</p>
                  <TableOfContents content={contentBlocks} />
                </div>
              )}

              {/* Newsletter */}
              <div className={styles.sidebarWidget}>
                <p className={styles.sidebarWidgetTitle}>Get study updates</p>
                <NewsletterForm />
              </div>

              {/* Related Posts */}
              {relatedPostsList.length > 0 && (
                <div className={styles.sidebarWidget}>
                  <p className={styles.sidebarWidgetTitle}>Related Study Guides</p>
                  <div className={styles.sidebarRelatedList}>
                    {relatedPostsList.map((p) => (
                      <div key={p.id} className={styles.sidebarRelatedItemWrapper}>
                        <Link href={`/blog/${p.slug}`} className={styles.sidebarRelatedItem}>
                          {p.title.length > 55 ? p.title.substring(0, 55) + "…" : p.title}
                        </Link>
                        <time className={styles.sidebarRelatedDate}>
                          {format(new Date(p.publishedAt), "yyyy")}
                        </time>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>
      </article>

      {/* ── Keep Reading (full-width, below article) ── */}
      {relatedPostsList.length > 0 && (
        <section className={styles.keepReading} aria-label="Keep reading">
          <div className="container">
            <h2 className={styles.keepReadingTitle}>Keep reading</h2>
            <div className={styles.keepReadingGrid}>
              {relatedPostsList.slice(0, 3).map((p) => {
                const cardImgUrl = getStrapiImageUrl(p.coverImage?.url);
                return (
                  <Link key={p.id} href={`/blog/${p.slug}`} className={styles.keepReadingCard}>
                    {cardImgUrl && (
                      <div className={styles.keepReadingCardImage}>
                        <Image
                          src={cardImgUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 960px) 100vw, 380px"
                          className={styles.keepReadingCardImg}
                        />
                      </div>
                    )}
                    <div className={styles.keepReadingCardBody}>
                      {p.category && (
                        <div className={styles.keepReadingCardCategory}>
                          {p.category.name}
                        </div>
                      )}
                      <h3 className={styles.keepReadingCardTitle}>{p.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
