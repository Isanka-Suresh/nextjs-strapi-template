import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPosts, getAllCategorySlugs } from "@/lib/strapi";
import { BlogCard } from "@/components/blog/BlogCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category not found" };
    return {
      title: `${category.name} — Category`,
      description: category.description || `Browse all ${category.name} articles on DevPulse.`,
    };
  } catch {
    return { title: "Category" };
  }
}

export const revalidate = 60;
export const dynamicParams = true;

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  let category, postsRes;
  try {
    [category, postsRes] = await Promise.all([
      getCategoryBySlug(slug),
      getPosts({ category: slug, pageSize: 12 }),
    ]);
  } catch {
    notFound();
    return;
  }

  if (!category) notFound();

  const posts = postsRes?.data ?? [];
  const total = postsRes?.meta?.pagination?.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.header} style={{ "--cat-color": category.color } as React.CSSProperties}>
        <div className="container">
          <div className={styles.headerInner}>
            <span className={styles.dot} style={{ background: category.color }} />
            <div>
              <p className={styles.eyebrow}>Category</p>
              <h1 className={styles.title}>{category.name}</h1>
              {category.description && (
                <p className={styles.description}>{category.description}</p>
              )}
              <p className={styles.count}>{total} article{total !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <p className={styles.empty}>No articles in this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
