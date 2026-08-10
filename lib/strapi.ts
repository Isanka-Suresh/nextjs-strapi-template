import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type {
  Post,
  Author,
  Category,
  ContactSubmission,
  StrapiListResponse,
  StrapiSingleResponse,
} from "./types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const API_URL = `${STRAPI_URL}/api`;

// Optional API token for private/draft content access
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// ─────────────────────────────────────────────
// Core fetch helper
// Uses the new Cache Components model — caching
// is declared via 'use cache' + cacheLife/cacheTag
// at the call-site function, NOT via fetch options.
// ─────────────────────────────────────────────

async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (STRAPI_API_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    console.error(`Strapi API error: ${res.status} ${res.statusText} — ${url}`);
    // Return empty fallback to prevent Next.js build crashes when API is unavailable or forbidden
    return { data: [] } as unknown as T;
  }

  return res.json();
}

// ─────────────────────────────────────────────
// Build image URL helper
// ─────────────────────────────────────────────

export function getStrapiImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

// ─────────────────────────────────────────────
// Post populate query — reusable field selection
// Only fetches what the UI needs (no over-fetching)
// ─────────────────────────────────────────────

const POST_LIST_POPULATE = [
  `fields[0]=title`,
  `fields[1]=slug`,
  `fields[2]=excerpt`,
  `fields[3]=readingTime`,
  `fields[4]=featured`,
  `fields[5]=publishedAt`,
  `fields[6]=updatedAt`,
  `populate[coverImage][fields][0]=url`,
  `populate[coverImage][fields][1]=alternativeText`,
  `populate[coverImage][fields][2]=width`,
  `populate[coverImage][fields][3]=height`,
  `populate[coverImage][fields][4]=formats`,
  `populate[category][fields][0]=name`,
  `populate[category][fields][1]=slug`,
  `populate[category][fields][2]=color`,
  `populate[author][fields][0]=name`,
  `populate[author][fields][1]=slug`,
  `populate[author][populate][avatar][fields][0]=url`,
  `populate[author][populate][avatar][fields][1]=alternativeText`,
  `populate[author][populate][avatar][fields][2]=width`,
  `populate[author][populate][avatar][fields][3]=height`,
].join("&");

// For single post detail — includes content and seo fields
const POST_DETAIL_POPULATE = [
  `fields[0]=title`,
  `fields[1]=slug`,
  `fields[2]=excerpt`,
  `fields[3]=content`,
  `fields[4]=readingTime`,
  `fields[5]=featured`,
  `fields[6]=publishedAt`,
  `fields[7]=updatedAt`,
  `fields[8]=seoTitle`,
  `fields[9]=seoDescription`,
  `populate[coverImage][fields][0]=url`,
  `populate[coverImage][fields][1]=alternativeText`,
  `populate[coverImage][fields][2]=width`,
  `populate[coverImage][fields][3]=height`,
  `populate[coverImage][fields][4]=formats`,
  `populate[category][fields][0]=name`,
  `populate[category][fields][1]=slug`,
  `populate[category][fields][2]=color`,
  `populate[author][fields][0]=name`,
  `populate[author][fields][1]=slug`,
  `populate[author][fields][2]=bio`,
  `populate[author][fields][3]=twitter`,
  `populate[author][fields][4]=github`,
  `populate[author][fields][5]=website`,
  `populate[author][populate][avatar][fields][0]=url`,
  `populate[author][populate][avatar][fields][1]=alternativeText`,
  `populate[author][populate][avatar][fields][2]=width`,
  `populate[author][populate][avatar][fields][3]=height`,
].join("&");

// ─────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────

export async function getPosts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  author?: string;
  search?: string;
  featured?: boolean;
} = {}): Promise<StrapiListResponse<Post>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const { page = 1, pageSize = 9, category, author, search, featured } = params;

  const filters: string[] = [];
  if (category) filters.push(`filters[category][slug][$eq]=${category}`);
  if (author) filters.push(`filters[author][slug][$eq]=${author}`);
  if (search) filters.push(`filters[$or][0][title][$containsi]=${encodeURIComponent(search)}&filters[$or][1][excerpt][$containsi]=${encodeURIComponent(search)}`);
  if (featured !== undefined) filters.push(`filters[featured][$eq]=${featured}`);

  const query = [
    POST_LIST_POPULATE,
    `pagination[page]=${page}`,
    `pagination[pageSize]=${pageSize}`,
    `sort=publishedAt:desc`,
    ...filters,
  ].join("&");

  return strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`);
}

// React.cache() memoizes per-request — avoids double-fetching for
// generateMetadata + page component on the same request
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts", `post-${slug}`);

  const query = [
    `filters[slug][$eq]=${slug}`,
    POST_DETAIL_POPULATE,
  ].join("&");

  const res = await strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`);
  return res.data?.[0] ?? null;
});

export async function getAdjacentPosts(
  publishedAt: string,
  excludeSlug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const adjacentPopulate = [
    `fields[0]=title`,
    `fields[1]=slug`,
    `fields[2]=publishedAt`,
    `populate[coverImage][fields][0]=url`,
    `populate[coverImage][fields][1]=alternativeText`,
    `populate[category][fields][0]=name`,
    `populate[category][fields][1]=slug`,
    `populate[category][fields][2]=color`,
  ].join("&");

  const [prevRes, nextRes] = await Promise.all([
    strapiRequest<StrapiListResponse<Post>>(
      `/posts?filters[publishedAt][$lt]=${publishedAt}&filters[slug][$ne]=${excludeSlug}&sort=publishedAt:desc&pagination[pageSize]=1&${adjacentPopulate}`
    ),
    strapiRequest<StrapiListResponse<Post>>(
      `/posts?filters[publishedAt][$gt]=${publishedAt}&filters[slug][$ne]=${excludeSlug}&sort=publishedAt:asc&pagination[pageSize]=1&${adjacentPopulate}`
    ),
  ]);

  return {
    prev: prevRes.data?.[0] ?? null,
    next: nextRes.data?.[0] ?? null,
  };
}

export async function getRelatedPosts(
  categorySlug: string,
  excludeSlug: string,
  limit = 3
): Promise<Post[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const relatedPopulate = [
    `fields[0]=title`,
    `fields[1]=slug`,
    `fields[2]=excerpt`,
    `fields[3]=publishedAt`,
    `populate[coverImage][fields][0]=url`,
    `populate[coverImage][fields][1]=alternativeText`,
    `populate[category][fields][0]=name`,
    `populate[category][fields][1]=slug`,
    `populate[category][fields][2]=color`,
  ].join("&");

  const res = await strapiRequest<StrapiListResponse<Post>>(
    `/posts?filters[category][slug][$eq]=${categorySlug}&filters[slug][$ne]=${excludeSlug}&${relatedPopulate}&pagination[pageSize]=${limit}&sort=publishedAt:desc`
  );

  return res.data ?? [];
}

export async function getFeaturedPost(): Promise<Post | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  // Direct featured query instead of calling getPosts() to avoid nested 'use cache'
  const query = [
    `filters[featured][$eq]=true`,
    POST_LIST_POPULATE,
    `pagination[pageSize]=1`,
    `sort=publishedAt:desc`,
  ].join("&");

  const res = await strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`);
  return res.data?.[0] ?? null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");

  const res = await strapiRequest<StrapiListResponse<{ slug: string }>>(
    `/posts?fields[0]=slug&pagination[pageSize]=1000`
  );
  return res.data.map((p) => p.slug);
}

// For sitemap — includes updatedAt for accurate lastModified
export async function getAllPostsForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");

  const res = await strapiRequest<StrapiListResponse<{ slug: string; updatedAt: string }>>(
    `/posts?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=1000`
  );
  return res.data.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }));
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const res = await strapiRequest<StrapiListResponse<Category>>(
    `/categories?fields[0]=name&fields[1]=slug&fields[2]=description&fields[3]=color&pagination[pageSize]=100&sort=name:asc`
  );
  return res.data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories", `category-${slug}`);

  const res = await strapiRequest<StrapiListResponse<Category>>(
    `/categories?filters[slug][$eq]=${slug}&fields[0]=name&fields[1]=slug&fields[2]=description&fields[3]=color`
  );
  return res.data?.[0] ?? null;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map((c) => c.slug);
}

// For sitemap
export async function getAllCategoriesForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const res = await strapiRequest<StrapiListResponse<{ slug: string; updatedAt: string }>>(
    `/categories?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100`
  );
  return res.data.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt }));
}

// ─────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────

export async function getAuthors(): Promise<Author[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("authors");

  const res = await strapiRequest<StrapiListResponse<Author>>(
    `/authors?fields[0]=name&fields[1]=slug&fields[2]=bio&fields[3]=twitter&fields[4]=github&fields[5]=website&populate[avatar][fields][0]=url&populate[avatar][fields][1]=alternativeText&populate[avatar][fields][2]=width&populate[avatar][fields][3]=height&pagination[pageSize]=100`
  );
  return res.data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("authors", `author-${slug}`);

  const res = await strapiRequest<StrapiListResponse<Author>>(
    `/authors?filters[slug][$eq]=${slug}&fields[0]=name&fields[1]=slug&fields[2]=bio&fields[3]=twitter&fields[4]=github&fields[5]=website&populate[avatar][fields][0]=url&populate[avatar][fields][1]=alternativeText&populate[avatar][fields][2]=width&populate[avatar][fields][3]=height`
  );
  return res.data?.[0] ?? null;
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  const authors = await getAuthors();
  return authors.map((a) => a.slug);
}

// For sitemap
export async function getAllAuthorsForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("authors");

  const res = await strapiRequest<StrapiListResponse<{ slug: string; updatedAt: string }>>(
    `/authors?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100`
  );
  return res.data.map((a) => ({ slug: a.slug, updatedAt: a.updatedAt }));
}

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────

export async function submitContact(data: ContactSubmission): Promise<void> {
  await strapiRequest<StrapiSingleResponse<unknown>>("/contacts", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}
