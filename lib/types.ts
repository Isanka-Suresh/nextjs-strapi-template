// ─────────────────────────────────────────────
// Strapi Blocks content type (for @strapi/blocks-react-renderer)
// ─────────────────────────────────────────────

export type StrapiBlocksContent = Parameters<
  typeof import("@strapi/blocks-react-renderer").BlocksRenderer
>[0]["content"];

// ─────────────────────────────────────────────
// Strapi API Response wrapper types
// ─────────────────────────────────────────────

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

// ─────────────────────────────────────────────
// Author
// ─────────────────────────────────────────────

export interface Author {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: StrapiImage | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
}

// ─────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
}

// ─────────────────────────────────────────────
// Post (Blog)
// ─────────────────────────────────────────────

export interface Post {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: StrapiBlocksContent | null;
  coverImage: StrapiImage | null;
  readingTime: number;
  featured: boolean;
  tags: string[] | null;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  category: Category | null;
  author: Author | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

// ─────────────────────────────────────────────
// Contact Submission
// ─────────────────────────────────────────────

export interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// ─────────────────────────────────────────────
// Strapi List Response
// ─────────────────────────────────────────────

export interface StrapiMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}

// ─────────────────────────────────────────────
// Navigation / Pagination helpers
// ─────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}
