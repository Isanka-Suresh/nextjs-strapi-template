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
  getGlobalSetting,
} from "@/lib/strapi";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { LiveRefresh } from "@/components/blog/LiveRefresh";
import FAQAccordion from "@/components/common/FAQAccordion";
import GlobalCTA from "@/components/common/GlobalCTA";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Strapi not available at build time — pages will be generated on-demand
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const [relatedPosts, adjacent, globalSettingResult] = await Promise.allSettled([
    post.category ? getRelatedPosts(post.category.slug, slug) : Promise.resolve([]),
    getAdjacentPosts(post.publishedAt, slug),
    getGlobalSetting(),
  ]);

  const relatedPostsList = relatedPosts.status === "fulfilled" ? relatedPosts.value : [];
  const adjacentPosts = adjacent.status === "fulfilled" ? adjacent.value : { prev: null, next: null };
  const globalSetting = globalSettingResult.status === "fulfilled" ? globalSettingResult.value : null;

  const imageUrl = getStrapiImageUrl(post.coverImage?.url);
  const authorAvatarUrl = getStrapiImageUrl(post.author?.avatar?.url);

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
      
      <LiveRefresh slug={post.slug} initialUpdatedAt={post.updatedAt} />

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

            <div className={styles.meta}>
              <div className={styles.metaDateContainer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.eyeIcon}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <time dateTime={post.publishedAt} className={styles.date}>
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </time>
              </div>
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
        <div className="container">
          <div className={styles.articleLayout}>
            {/* ── Sidebar (Left) ── */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                {/* TOC */}
                {(post.htmlContent || post.content) && (
                  <div className={styles.sidebarWidget}>
                    <TableOfContents content={(post.htmlContent || post.content) as string} />
                  </div>
                )}

                {/* Related Posts */}
                {relatedPostsList.length > 0 && (
                  <div className={styles.sidebarWidget}>
                    <h3 className={styles.sidebarWidgetTitle}>Related Articles</h3>
                    <div className={styles.sidebarRelatedList}>
                      {relatedPostsList.map((p) => (
                        <Link key={p.id} href={`/blog/${p.slug}`} className={styles.sidebarRelatedItem}>
                          {p.coverImage && (
                            <div className={styles.sidebarRelatedImgWrapper}>
                              <Image
                                src={getStrapiImageUrl(p.coverImage.url)}
                                alt={p.title}
                                fill
                                sizes="80px"
                                className={styles.sidebarRelatedImg}
                              />
                            </div>
                          )}
                          <div className={styles.sidebarRelatedInfo}>
                            <h4 className={styles.sidebarRelatedTitle}>
                              {p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title}
                            </h4>
                            <time className={styles.sidebarRelatedDate}>
                              {format(new Date(p.publishedAt), "MMM d, yyyy")}
                            </time>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main Content (Right) ── */}
            <div className={styles.articleMain}>
              <div className={styles.content}>
                {(() => {
                  let rawContent = (post.htmlContent || post.content) as string || "";
                  
                  // Extract CTA URLs
                  const whatsappMatch = rawContent.match(/\[WhatsApp Us\]\((.*?)\)/i);
                  const bookMatch = rawContent.match(/\[Book a Free Consultation\]\((.*?)\)/i);
                  const enquireMatch = rawContent.match(/\[Enquire About.*?\]\((.*?)\)/i);
                  
                  const hasEmbeddedCta = whatsappMatch || bookMatch || enquireMatch;
                  const embeddedCtaUrls = hasEmbeddedCta ? {
                    whatsapp: whatsappMatch?.[1],
                    book: bookMatch?.[1],
                    enquire: enquireMatch?.[1]
                  } : null;

                  // Clean up the polluted markdown content
                  let cleanContent = rawContent;
                  cleanContent = cleanContent.replace(/\[Enquire About.*?\]\(.*?\)/gi, '');
                  cleanContent = cleanContent.replace(/\[WhatsApp Us\]\(.*?\)/gi, '');
                  cleanContent = cleanContent.replace(/\[Book a Free Consultation\]\(.*?\)/gi, '');
                  cleanContent = cleanContent.replace(/This guide is for general information.*?requirements at the time you apply\./gi, '');
                  
                  cleanContent = cleanContent.replace(/!\[.*?Education Consultant.*?\]\(.*?\)/gi, '');
                  cleanContent = cleanContent.replace(/Jackline Wahu[\s\S]*?accurate and current\./gi, '');
                  
                  cleanContent = cleanContent.replace(/\[NEXT.*?\]\(.*?\)/gi, '');

                  return (
                    <>
                      {cleanContent ? (
                        <MarkdownRenderer content={cleanContent} className={styles.prose} />
                      ) : null}

                      {/* ── Global CTA ── */}
                      {embeddedCtaUrls ? (
                        <GlobalCTA 
                          heading="Enquire About ACCA at LSBF"
                          text="This guide is for general information. It does not guarantee admission, scholarships, or visa approval — your eligibility depends on your individual academic record and current LSBF/ACCA requirements at the time you apply."
                          linkText="WhatsApp Us"
                          linkUrl={embeddedCtaUrls.whatsapp}
                          secondaryLinkText="Book a Free Consultation"
                          secondaryLinkUrl={embeddedCtaUrls.book}
                        />
                      ) : globalSetting && (
                        <GlobalCTA 
                          heading={globalSetting.ctaHeading} 
                          text={globalSetting.ctaText} 
                          linkText={globalSetting.ctaLinkText} 
                          linkUrl={globalSetting.ctaLinkUrl}
                          secondaryLinkText={globalSetting.ctaSecondaryLinkText}
                          secondaryLinkUrl={globalSetting.ctaSecondaryLinkUrl}
                        />
                      )}
                    </>
                  );
                })()}



                {/* ── FAQs ── */}
                {(post as any).faqs && (post as any).faqs.length > 0 && (
                  <FAQAccordion faqs={(post as any).faqs} />
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
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                    <Image src={authorAvatarUrl} alt={post.author.name} width={80} height={80} className={styles.authorCardAvatar} />
                  ) : (
                    <span className={styles.authorCardInitial}>{post.author.name.charAt(0)}</span>
                  )}
                  <div className={styles.authorCardInfo}>
                    <Link href={`/author/${post.author.slug}`} className={styles.authorCardName}>
                      {post.author.name}
                    </Link>
                    <p className={styles.authorCardLabel}>Education Consultant, Studies in Malaysia</p>
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

        {/* Related Posts moved to sidebar */}
      </article>
    </>
  );
}
