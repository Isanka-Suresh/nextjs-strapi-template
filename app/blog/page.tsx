import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/strapi";
import type { Category, StrapiListResponse, Post } from "@/lib/types";
import { BlogCard } from "@/components/blog/BlogCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Browse all articles on web development, JavaScript, design systems, and developer tools.",
};


interface SearchParams {
  page?: string;
  category?: string;
  search?: string;
}

export const instant = false;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const category = params.category || undefined;
  const search = params.search || undefined;

  let postsRes: StrapiListResponse<Post> = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 9, pageCount: 0, total: 0 } },
  };
  let categories: Category[] = [];

  try {
    [postsRes, categories] = await Promise.all([
      getPosts({ page, pageSize: 9, category, search }),
      getCategories(),
    ]);
  } catch {
    // Strapi offline
  }

  const posts = postsRes.data ?? [];
  const pagination = postsRes.meta?.pagination;
  const pageCount = pagination?.pageCount ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <div className={styles.blogPage}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className={styles.eyebrow}>The Blog</span>
          <h1 className={styles.pageTitle}>
            {search
              ? `Search: "${search}"`
              : category
              ? `Category: ${categories.find((c) => c.slug === category)?.name ?? category}`
              : "All Articles"}
          </h1>
          <p className={styles.pageSubtitle}>
            {total} article{total !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="container">
        {/* ── Filters & Search ── */}
        <div className={styles.filterBar}>
          {/* Search */}
          <form className={styles.searchForm} action="/blog" method="get">
            {category && <input type="hidden" name="category" value={category} />}
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search articles..."
                className={styles.searchInput}
                aria-label="Search articles"
              />
            </div>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>

          {/* Category filters */}
          <div className={styles.categoryFilters}>
            <Link
              href="/blog"
              className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ""}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}${search ? `&search=${search}` : ""}`}
                className={`${styles.categoryChip} ${category === cat.slug ? styles.categoryChipActive : ""}`}
                style={
                  category === cat.slug
                    ? { background: cat.color, color: "white", borderColor: cat.color }
                    : {}
                }
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Posts Grid ── */}
        {posts.length > 0 ? (
          <>
            <div className={styles.grid}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                    className={`${styles.pageBtn} ${styles.pageBtnPrev}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Link>
                )}
                <div className={styles.pageNumbers}>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/blog?page=${p}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                      className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ""}`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                {page < pageCount && (
                  <Link
                    href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                    className={`${styles.pageBtn} ${styles.pageBtnNext}`}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2>No articles found</h2>
            <p>
              {search ? `No results for "${search}". Try a different search term.` : "No articles in this category yet."}
            </p>
            <Link href="/blog" className={styles.resetLink}>View all articles</Link>
          </div>
        )}
      </div>
    </div>
  );
}
