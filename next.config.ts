import type { NextConfig } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

// Allowed Strapi origins for image optimization
const strapiOrigins = [
  { protocol: "http" as const, hostname: "localhost", port: "1337", pathname: "/uploads/**" },
  { protocol: "https" as const, hostname: "strapi-sample-production-cd83.up.railway.app", pathname: "/uploads/**" },
  { protocol: "https" as const, hostname: "*.railway.app", pathname: "/uploads/**" },
  { protocol: "https" as const, hostname: "*.render.com", pathname: "/uploads/**" },
  // Add Cloudinary if you migrate Strapi media to cloud storage:
  // { protocol: "https" as const, hostname: "res.cloudinary.com", pathname: "/**" },
];

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy — send origin only on same-site, full URL cross-site HTTPS
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable permissions not needed for a blog
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // DNS prefetch control
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Strict Transport Security (enable once HTTPS is confirmed on production)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content Security Policy — tightened for blog use case
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Inline scripts required for theme init and next.js internals
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      // Images from self + Strapi origins + data URIs
      `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"} *.railway.app *.render.com`,
      // Fonts are self-hosted via next/font — no external fonts needed
      "font-src 'self'",
      // Strapi API calls from browser (newsletter form, contact)
      `connect-src 'self' ${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}`,
      // OG image generation runs on server — no frame-src needed
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR + 'use cache' directive)
  // This is the new primary caching model in Next.js 16.x
  cacheComponents: true,

  images: {
    // Enable AVIF for best compression (WebP is fallback)
    formats: ["image/avif", "image/webp"],
    remotePatterns: strapiOrigins,
    // Optimize images served via Next.js image optimizer
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Tighten CORS on the revalidate webhook:
        // Only allow requests from the Strapi server itself (not public browsers)
        source: "/api/revalidate",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337" },
          { key: "Access-Control-Allow-Methods", value: "POST, GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        // Cache static assets aggressively at edge
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Disable X-Powered-By header to avoid fingerprinting
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

export default nextConfig;
