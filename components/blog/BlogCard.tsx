import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Post } from "@/lib/types";
import { getStrapiImageUrl } from "@/lib/strapi";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const imageUrl = getStrapiImageUrl(post.coverImage?.url);
  const date = post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "";

  return (
    <article className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <Link href={`/blog/${post.slug}`} className={styles.imageWrapper} tabIndex={-1} aria-hidden>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.coverImage?.alternativeText || post.title}
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {post.category && (
          <span
            className={styles.categoryBadge}
            style={{ background: post.category.color || "var(--color-primary)" }}
          >
            {post.category.name}
          </span>
        )}
      </Link>

      <div className={styles.body}>
        {/* Meta */}
        <div className={styles.meta}>
          <time dateTime={post.publishedAt} className={styles.date}>
            {date}
          </time>
          <span className={styles.dot}>·</span>
          <span className={styles.readTime}>{post.readingTime} min read</span>
        </div>

        {/* Title */}
        <h2 className={styles.title}>
          <Link href={`/blog/${post.slug}`} className={styles.titleLink}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className={styles.excerpt}>{post.excerpt}</p>

        {/* Author + CTA */}
        <div className={styles.footer}>
          {post.author && (
            <Link href={`/author/${post.author.slug}`} className={styles.author}>
              {post.author.avatar ? (
                <Image
                  src={getStrapiImageUrl(post.author.avatar.url)}
                  alt={post.author.name}
                  width={28}
                  height={28}
                  className={styles.authorAvatar}
                />
              ) : (
                <span className={styles.authorInitial}>
                  {post.author.name.charAt(0)}
                </span>
              )}
              <span className={styles.authorName}>{post.author.name}</span>
            </Link>
          )}
          <Link href={`/blog/${post.slug}`} className={styles.readMore}>
            Read more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
