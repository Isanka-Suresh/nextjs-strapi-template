// ─────────────────────────────────────────────
// Strapi API Response wrapper types
// ─────────────────────────────────────────────

import type { BlocksContent } from '@strapi/blocks-react-renderer';


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
  coverImage: StrapiImage | null;
  readingTime: number;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  category: Category | null;
  author: Author | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Structured Strapi Blocks JSON — rendered with BlocksRenderer */
  htmlContent: BlocksContent | null;
  excerpt: string | null;
  keywords: any;
  date: string | null;
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
