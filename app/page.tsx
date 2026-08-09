import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPosts, getFeaturedPost, getCategories, getStrapiImageUrl } from "@/lib/strapi";
import type { Post, Category, StrapiListResponse } from "@/lib/types";
import { BlogCard } from "@/components/blog/BlogCard";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { format } from "date-fns";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "DevPulse Blog — Insights for Modern Developers",
  description:
    "Discover the latest articles on web development, JavaScript, design systems, and developer tools. Written by passionate developers.",
};

export const revalidate = 60;

export default async function HomePage() {
  let featuredPost: Post | null = null;
  let latestRes: StrapiListResponse<Post> = {
    data: [],
    meta: { pagination: { total: 0, page: 1, pageSize: 6, pageCount: 0 } },
  };
  let categories: Category[] = [];

  try {
    [featuredPost, latestRes, categories] = await Promise.all([
      getFeaturedPost(),
      getPosts({ pageSize: 6 }),
      getCategories(),
    ]);
  } catch {
    // Strapi offline — render with empty data
  }

  const latestPosts = latestRes.data ?? [];
  const featuredImageUrl = getStrapiImageUrl(featuredPost?.coverImage?.url);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`${styles.badge} animate-fadeInUp`}>
              <span className={styles.badgeDot} />
              Now live — DevPulse v2.0
            </div>
            <h1 className={`${styles.heroTitle} animate-fadeInUp`} style={{ animationDelay: "0.1s" }}>
              Ideas that{" "}
              <span className="text-gradient">move the web</span>{" "}
              forward
            </h1>
            <p className={`${styles.heroSubtitle} animate-fadeInUp`} style={{ animationDelay: "0.2s" }}>
              Deep dives, tutorials, and perspectives on modern web development,
              JavaScript, design systems, and developer culture.
            </p>
            <div className={`${styles.heroActions} animate-fadeInUp`} style={{ animationDelay: "0.3s" }}>
              <Link href="/blog" className={styles.heroCta}>
                Explore the Blog
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/about" className={styles.heroSecondary}>
                About us
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className={`${styles.stats} animate-fadeInUp`} style={{ animationDelay: "0.4s" }}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{latestRes.meta?.pagination?.total ?? "20"}+</span>
              <span className={styles.statLabel}>Articles</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{categories.length ?? "10"}+</span>
              <span className={styles.statLabel}>Topics</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>Weekly</span>
              <span className={styles.statLabel}>Updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED POST ═══ */}
      {featuredPost && (
        <section className={styles.featured}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Featured</span>
              <h2 className={styles.sectionTitle}>Editor&apos;s Pick</h2>
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                {featuredImageUrl ? (
                  <Image
                    src={featuredImageUrl}
                    alt={featuredPost.coverImage?.alternativeText || featuredPost.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className={styles.featuredImg}
                  />
                ) : (
                  <div className={styles.featuredImgPlaceholder} />
                )}
                {featuredPost.category && (
                  <span
                    className={styles.featuredCategory}
                    style={{ background: featuredPost.category.color || "var(--color-primary)" }}
                  >
                    {featuredPost.category.name}
                  </span>
                )}
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.featuredMeta}>
                  <time dateTime={featuredPost.publishedAt}>
                    {format(new Date(featuredPost.publishedAt), "MMMM d, yyyy")}
                  </time>
                  <span>·</span>
                  <span>{featuredPost.readingTime} min read</span>
                </div>
                <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                {featuredPost.author && (
                  <div className={styles.featuredAuthor}>
                    {featuredPost.author.avatar && (
                      <Image
                        src={getStrapiImageUrl(featuredPost.author.avatar.url)}
                        alt={featuredPost.author.name}
                        width={36}
                        height={36}
                        className={styles.featuredAuthorAvatar}
                      />
                    )}
                    <div>
                      <p className={styles.featuredAuthorName}>{featuredPost.author.name}</p>
                      <p className={styles.featuredAuthorBio}>Author</p>
                    </div>
                  </div>
                )}
                <span className={styles.featuredReadBtn}>
                  Read full article
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ═══ LATEST POSTS ═══ */}
      <section className={styles.latest}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Latest</span>
            <h2 className={styles.sectionTitle}>Fresh from the blog</h2>
            <Link href="/blog" className={styles.sectionLink}>
              View all posts →
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className={styles.grid}>
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      {categories.length > 0 && (
        <section className={styles.categories}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Topics</span>
              <h2 className={styles.sectionTitle}>Browse by category</h2>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={styles.categoryCard}
                  style={{ "--cat-color": cat.color || "#6366f1" } as React.CSSProperties}
                >
                  <span
                    className={styles.categoryDot}
                    style={{ background: cat.color || "var(--color-primary)" }}
                  />
                  <span className={styles.categoryName}>{cat.name}</span>
                  {cat.description && (
                    <span className={styles.categoryDesc}>{cat.description}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ NEWSLETTER CTA ═══ */}
      <section className={styles.newsletter}>
        <div className="container">
          <div className={styles.newsletterCard}>
            <div className={styles.newsletterGlow} aria-hidden />
            <div className={styles.newsletterContent}>
              <span className={styles.newsletterEyebrow}>Newsletter</span>
              <h2 className={styles.newsletterTitle}>Stay in the loop</h2>
              <p className={styles.newsletterDesc}>
                Get the latest articles delivered straight to your inbox. No spam, ever.
              </p>
              <NewsletterForm />
              <p className={styles.newsletterNote}>Join 1,000+ developers. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
