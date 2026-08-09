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

// ─────────────────────────────────────────────
// Core fetch helper
// ─────────────────────────────────────────────

async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const { next, ...fetchOptions } = options;

  const res = await fetch(url, {
    ...fetchOptions,
    next,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText} — ${url}`);
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
  const { page = 1, pageSize = 9, category, author, search, featured } = params;

  const filters: string[] = [];
  if (category) filters.push(`filters[category][slug][$eq]=${category}`);
  if (author) filters.push(`filters[author][slug][$eq]=${author}`);
  if (search) filters.push(`filters[$or][0][title][$containsi]=${search}&filters[$or][1][excerpt][$containsi]=${search}`);
  if (featured !== undefined) filters.push(`filters[featured][$eq]=${featured}`);

  const query = [
    `populate[0]=coverImage`,
    `populate[1]=category`,
    `populate[2]=author`,
    `populate[3]=author.avatar`,
    `pagination[page]=${page}`,
    `pagination[pageSize]=${pageSize}`,
    `sort=publishedAt:desc`,
    ...filters,
  ].join("&");

  return strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`, {
    next: { revalidate: 60, tags: ["posts"] },
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = [
    `filters[slug][$eq]=${slug}`,
    `populate[0]=coverImage`,
    `populate[1]=category`,
    `populate[2]=author`,
    `populate[3]=author.avatar`,
  ].join("&");

  const res = await strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`, {
    next: { revalidate: 60, tags: [`post-${slug}`] },
  });

  return res.data?.[0] ?? null;
}

export async function getAdjacentPosts(
  publishedAt: string,
  excludeSlug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  const [prevRes, nextRes] = await Promise.all([
    strapiRequest<StrapiListResponse<Post>>(
      `/posts?filters[publishedAt][$lt]=${publishedAt}&filters[slug][$ne]=${excludeSlug}&sort=publishedAt:desc&pagination[pageSize]=1&populate[0]=coverImage&populate[1]=category`,
      { next: { revalidate: 60, tags: ["posts"] } }
    ),
    strapiRequest<StrapiListResponse<Post>>(
      `/posts?filters[publishedAt][$gt]=${publishedAt}&filters[slug][$ne]=${excludeSlug}&sort=publishedAt:asc&pagination[pageSize]=1&populate[0]=coverImage&populate[1]=category`,
      { next: { revalidate: 60, tags: ["posts"] } }
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
  const query = [
    `filters[category][slug][$eq]=${categorySlug}`,
    `filters[slug][$ne]=${excludeSlug}`,
    `populate[0]=coverImage`,
    `populate[1]=category`,
    `populate[2]=author`,
    `pagination[pageSize]=${limit}`,
    `sort=publishedAt:desc`,
  ].join("&");

  const res = await strapiRequest<StrapiListResponse<Post>>(`/posts?${query}`, {
    next: { revalidate: 60, tags: ["posts"] },
  });

  return res.data ?? [];
}

export async function getFeaturedPost(): Promise<Post | null> {
  const res = await getPosts({ featured: true, pageSize: 1 });
  return res.data?.[0] ?? null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const res = await strapiRequest<StrapiListResponse<{ slug: string }>>(
    `/posts?fields[0]=slug&pagination[pageSize]=1000`,
    { next: { revalidate: 3600, tags: ["posts"] } }
  );
  return res.data.map((p) => p.slug);
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await strapiRequest<StrapiListResponse<Category>>(
    `/categories?pagination[pageSize]=100&sort=name:asc`,
    { next: { revalidate: 3600, tags: ["categories"] } }
  );
  return res.data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await strapiRequest<StrapiListResponse<Category>>(
    `/categories?filters[slug][$eq]=${slug}`,
    { next: { revalidate: 3600, tags: ["categories"] } }
  );
  return res.data?.[0] ?? null;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map((c) => c.slug);
}

// ─────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────

export async function getAuthors(): Promise<Author[]> {
  const res = await strapiRequest<StrapiListResponse<Author>>(
    `/authors?populate[0]=avatar&pagination[pageSize]=100`,
    { next: { revalidate: 3600, tags: ["authors"] } }
  );
  return res.data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const res = await strapiRequest<StrapiListResponse<Author>>(
    `/authors?filters[slug][$eq]=${slug}&populate[0]=avatar`,
    { next: { revalidate: 3600, tags: ["authors"] } }
  );
  return res.data?.[0] ?? null;
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  const authors = await getAuthors();
  return authors.map((a) => a.slug);
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
