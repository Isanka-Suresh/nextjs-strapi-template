import type { MetadataRoute } from "next";
import {
  getAllPostsForSitemap,
  getAllCategoriesForSitemap,
  getAllAuthorsForSitemap,
} from "@/lib/strapi";
import { cacheLife, cacheTag } from "next/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", "categories", "authors");

  let posts: Array<{ slug: string; updatedAt: string }> = [];
  let categories: Array<{ slug: string; updatedAt: string }> = [];
  let authors: Array<{ slug: string; updatedAt: string }> = [];

  try {
    [posts, categories, authors] = await Promise.all([
      getAllPostsForSitemap(),
      getAllCategoriesForSitemap(),
      getAllAuthorsForSitemap(),
    ]);
  } catch {
    // Strapi offline — return only static pages
  }

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2024-01-01"), // Static page — rarely changes
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${SITE_URL}/author/${author.slug}`,
    lastModified: author.updatedAt ? new Date(author.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...authorPages];
}
