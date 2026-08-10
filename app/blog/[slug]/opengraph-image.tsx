import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/strapi";

// OG image dimensions — standard 1200×630
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let title = "EduHub Blog";
  let categoryName = "";
  let authorName = "";
  let excerpt = "";

  try {
    const post = await getPostBySlug(slug);
    if (post) {
      title = post.seoTitle || post.title;
      categoryName = post.category?.name ?? "";
      authorName = post.author?.name ?? "";
      excerpt = post.seoDescription ?? "";
    }
  } catch {
    // Use fallback values
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #13131f 60%, #1e1b4b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header: Logo + Category */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* EduHub Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🎓
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.5px",
              }}
            >
              EduHub
            </span>
          </div>

          {/* Category badge */}
          {categoryName && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                borderRadius: 9999,
                padding: "8px 20px",
                fontSize: 16,
                color: "#818cf8",
                fontWeight: 600,
              }}
            >
              {categoryName}
            </div>
          )}
        </div>

        {/* Main content: title + excerpt */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Gradient accent line */}
          <div
            style={{
              width: 64,
              height: 4,
              borderRadius: 9999,
              background: "linear-gradient(90deg, #6366f1, #ec4899)",
            }}
          />

          <div
            style={{
              fontSize: title.length > 60 ? 44 : 52,
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "90%",
            }}
          >
            {title}
          </div>

          {excerpt && (
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                lineHeight: 1.5,
                maxWidth: "85%",
                // Truncate long excerpts
                display: "-webkit-box",
                overflow: "hidden",
              }}
            >
              {excerpt.length > 120 ? excerpt.slice(0, 120) + "…" : excerpt}
            </div>
          )}
        </div>

        {/* Footer: author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {authorName && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {authorName.charAt(0)}
              </div>
              <span style={{ fontSize: 18, color: "#94a3b8", fontWeight: 500 }}>
                {authorName}
              </span>
            </div>
          )}

          <div
            style={{
              fontSize: 16,
              color: "#475569",
              fontWeight: 500,
            }}
          >
            eduhub.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
