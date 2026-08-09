import type { MetadataRoute } from "next";
import { getAllPostSlugs, getAllCategorySlugs, getAllAuthorSlugs } from "@/lib/strapi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let postSlugs: string[] = [];
  let categorySlugs: string[] = [];
  let authorSlugs: string[] = [];

  try {
    [postSlugs, categorySlugs, authorSlugs] = await Promise.all([
      getAllPostSlugs(),
      getAllCategorySlugs(),
      getAllAuthorSlugs(),
    ]);
  } catch {
    // Strapi offline — return only static pages
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const postPages: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = authorSlugs.map((slug) => ({
    url: `${SITE_URL}/author/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...authorPages];
}
