import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getPosts, getAllAuthorSlugs, getStrapiImageUrl } from "@/lib/strapi";
import { BlogCard } from "@/components/blog/BlogCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllAuthorSlugs();
    if (slugs.length === 0) return [{ slug: "placeholder" }];
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [{ slug: "placeholder" }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "placeholder") return { title: "Placeholder" };
  try {
    const author = await getAuthorBySlug(slug);
    if (!author) return { title: "Author not found" };
    return {
      title: `${author.name} — Author`,
      description: author.bio || `Read all articles by ${author.name} on DevPulse.`,
    };
  } catch {
    return { title: "Author" };
  }
}


export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "placeholder") notFound();
  
  const [author, postsRes] = await Promise.all([
    getAuthorBySlug(slug),
    getPosts({ author: slug, pageSize: 12 }),
  ]);

  if (!author) notFound();

  const posts = postsRes.data ?? [];
  const avatarUrl = getStrapiImageUrl(author.avatar?.url);

  return (
    <div className={styles.page}>
      {/* Author Header */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.profile}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={author.name}
                width={100}
                height={100}
                className={styles.avatar}
              />
            ) : (
              <span className={styles.avatarInitial}>{author.name.charAt(0)}</span>
            )}
            <div className={styles.profileInfo}>
              <p className={styles.eyebrow}>Author</p>
              <h1 className={styles.name}>{author.name}</h1>
              {author.bio && <p className={styles.bio}>{author.bio}</p>}
              <div className={styles.socials}>
                {author.twitter && (
                  <a href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                     target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    {author.twitter}
                  </a>
                )}
                {author.github && (
                  <a href={`https://github.com/${author.github}`}
                     target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    {author.github}
                  </a>
                )}
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="container">
        <div className={styles.postsHeader}>
          <h2 className={styles.postsTitle}>
            Articles by {author.name}
            <span className={styles.postsCount}>{postsRes.meta?.pagination?.total ?? 0}</span>
          </h2>
        </div>
        <div className={styles.grid}>
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <p className={styles.empty}>No articles published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
