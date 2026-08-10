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
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    if (slugs.length === 0) return [{ slug: "placeholder" }];
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Strapi not available at build time — return placeholder to satisfy cacheComponents validation
    return [{ slug: "placeholder" }];
  }
}

// React.cache() in getPostBySlug ensures generateMetadata and the page
// component share a single Strapi fetch per request (no double-fetching)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "placeholder") return { title: "Placeholder" };
  
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post not found" };

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
    const imageUrl = getStrapiImageUrl(post.coverImage?.url);
    const canonicalUrl = `${SITE_URL}/blog/${slug}`;

    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.title,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || post.title,
        type: "article",
        url: canonicalUrl,
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: post.author ? [post.author.name] : [],
        images: imageUrl
          ? [{ url: imageUrl, width: post.coverImage?.width, height: post.coverImage?.height, alt: post.coverImage?.alternativeText || post.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || post.title,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}


export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "placeholder") notFound();

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  const [relatedPosts, adjacent] = await Promise.allSettled([
    post.category ? getRelatedPosts(post.category.slug, slug) : Promise.resolve([]),
    getAdjacentPosts(post.publishedAt, slug),
  ]);

  const relatedPostsList = relatedPosts.status === "fulfilled" ? relatedPosts.value : [];
  const adjacentPosts = adjacent.status === "fulfilled" ? adjacent.value : { prev: null, next: null };

  const imageUrl = getStrapiImageUrl(post.coverImage?.url);
  const authorAvatarUrl = getStrapiImageUrl(post.author?.avatar?.url);
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;

  // Article structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt || post.title,
    image: imageUrl || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: canonicalUrl,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          url: `${SITE_URL}/author/${post.author.slug}`,
          ...(post.author.twitter ? { sameAs: [`https://twitter.com/${post.author.twitter}`] } : {}),
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "EduHub",
      url: SITE_URL,
    },
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ...(post.category
        ? [{ "@type": "ListItem", position: 3, name: post.category.name, item: `${SITE_URL}/category/${post.category.slug}` }]
        : []),
      { "@type": "ListItem", position: post.category ? 4 : 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className="container">
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>›</span>
              <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
              {post.category && (
                <>
                  <span className={styles.breadcrumbSep}>›</span>
                  <Link href={`/category/${post.category.slug}`} className={styles.breadcrumbLink}>
                    {post.category.name}
                  </Link>
                </>
              )}
            </nav>

            {post.category && (
              <Link
                href={`/category/${post.category.slug}`}
                className={styles.categoryBadge}
                style={{ background: post.category.color || "var(--color-primary)" }}
              >
                {post.category.name}
              </Link>
            )}

            <h1 className={styles.title}>{post.title}</h1>

            {post.excerpt && (
              <p className={styles.excerpt}>{post.excerpt}</p>
            )}

            <div className={styles.meta}>
              {post.author && (
                <Link href={`/author/${post.author.slug}`} className={styles.authorMeta}>
                  {authorAvatarUrl ? (
                    <Image src={authorAvatarUrl} alt={post.author.name} width={40} height={40} className={styles.authorAvatar} />
                  ) : (
                    <span className={styles.authorInitial}>{post.author.name.charAt(0)}</span>
                  )}
                  <span className={styles.authorName}>{post.author.name}</span>
                </Link>
              )}
              <div className={styles.metaDivider} />
              <time dateTime={post.publishedAt} className={styles.date}>
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </time>
              <div className={styles.metaDivider} />
              <span className={styles.readTime}>{post.readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* ── Cover Image ── */}
        {imageUrl && (
          <div className={styles.coverImageWrapper}>
            <div className="container">
              <div className={styles.coverImageInner}>
                <Image
                  src={imageUrl}
                  alt={post.coverImage?.alternativeText || post.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className={styles.coverImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Content + TOC ── */}
        <div className="container--blog">
          <div className={styles.articleLayout}>
            {/* TOC Sidebar — client component for scroll tracking */}
            {post.content && (
              <TableOfContents content={post.content} />
            )}

            {/* Main Content — rendered on server via BlocksRenderer */}
            <div className={styles.articleMain}>
              <div className={styles.content}>
                {post.content && (
                  <MarkdownRenderer content={post.content} className={styles.prose} />
                )}
              </div>

              {/* ── Share ── */}
              <div className={styles.shareSection}>
                <span className={styles.shareLabel}>Share this article</span>
                <div className={styles.shareButtons}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                    aria-label="Share on X (Twitter)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                    aria-label="Share on LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
                    <Image src={authorAvatarUrl} alt={post.author.name} width={64} height={64} className={styles.authorCardAvatar} />
                  ) : (
                    <span className={styles.authorCardInitial}>{post.author.name.charAt(0)}</span>
                  )}
                  <div className={styles.authorCardInfo}>
                    <p className={styles.authorCardLabel}>Written by</p>
                    <Link href={`/author/${post.author.slug}`} className={styles.authorCardName}>
                      {post.author.name}
                    </Link>
                    {post.author.bio && <p className={styles.authorCardBio}>{post.author.bio}</p>}
                  </div>
                </div>
              )}

              {/* ── Prev / Next ── */}
              {(adjacentPosts.prev || adjacentPosts.next) && (
                <nav className={styles.prevNext} aria-label="Article navigation">
                  {adjacentPosts.prev ? (
                    <Link href={`/blog/${adjacentPosts.prev.slug}`} className={styles.prevNextLink}>
                      <span className={styles.prevNextLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </span>
                      <span className={styles.prevNextTitle}>{adjacentPosts.prev.title}</span>
                    </Link>
                  ) : <div />}
                  {adjacentPosts.next ? (
                    <Link href={`/blog/${adjacentPosts.next.slug}`} className={`${styles.prevNextLink} ${styles.prevNextRight}`}>
                      <span className={styles.prevNextLabel}>
                        Next
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span className={styles.prevNextTitle}>{adjacentPosts.next.title}</span>
                    </Link>
                  ) : <div />}
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Posts ── */}
        {relatedPostsList.length > 0 && (
          <section className={styles.related}>
            <div className="container">
              <h2 className={styles.relatedTitle}>Related Articles</h2>
              <div className={styles.relatedGrid}>
                {relatedPostsList.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className={styles.relatedCard}>
                    {p.coverImage && (
                      <div className={styles.relatedImage}>
                        <Image
                          src={getStrapiImageUrl(p.coverImage.url)}
                          alt={p.coverImage.alternativeText || p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={styles.relatedImg}
                        />
                      </div>
                    )}
                    <div className={styles.relatedBody}>
                      {p.category && (
                        <span className={styles.relatedCategory} style={{ color: p.category.color || "var(--color-primary)" }}>
                          {p.category.name}
                        </span>
                      )}
                      <h3 className={styles.relatedPostTitle}>{p.title}</h3>
                      {p.excerpt && (
                        <p className={styles.relatedExcerpt}>{p.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
