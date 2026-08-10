import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

// ─────────────────────────────────────────────
// Secret verification (Bearer token or query param)
// ─────────────────────────────────────────────

function verifySecret(req: NextRequest): boolean {
  if (!REVALIDATE_SECRET) {
    console.error("[Webhook] ❌ REVALIDATE_SECRET is not set — rejecting all requests");
    return false;
  }

  // Check Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === REVALIDATE_SECRET) return true;
  }

  // Check ?secret=xxx query param (Strapi webhook config)
  const querySecret = req.nextUrl.searchParams.get("secret");
  if (querySecret && querySecret === REVALIDATE_SECRET) return true;

  return false;
}

// ─────────────────────────────────────────────
// Strapi webhook payload shape:
// {
//   event: "entry.publish" | "entry.unpublish" | "entry.update" | "entry.delete" | "entry.create"
//   model: "post" | "category" | "author" | "contact"
//   entry: { slug?: string, id: number, ... }
// }
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json(
      { message: "Unauthorized — invalid or missing secret" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const event = body?.event as string | undefined;
  const model = body?.model as string | undefined;
  const entry = body?.entry as Record<string, unknown> | undefined;
  const slug = entry?.slug as string | undefined;

  // Ignore irrelevant events (e.g. media uploads, user changes)
  const relevantModels = ["post", "category", "author"];
  if (model && !relevantModels.includes(model)) {
    return NextResponse.json({ revalidated: false, reason: "model not tracked" });
  }

  try {
    const revalidated: string[] = [];

    if (model === "post" || !model) {
      // Invalidate the shared posts list cache
      revalidateTag("posts", "max");
      revalidated.push("posts");

      // Invalidate the specific post cache if we have a slug
      if (slug) {
        revalidateTag(`post-${slug}`, "max");
        revalidated.push(`post-${slug}`);
      }
    }

    if (model === "category") {
      revalidateTag("categories", "max");
      revalidated.push("categories");

      if (slug) {
        revalidateTag(`category-${slug}`, "max");
        revalidated.push(`category-${slug}`);
      }
    }

    if (model === "author") {
      revalidateTag("authors", "max");
      revalidated.push("authors");

      if (slug) {
        revalidateTag(`author-${slug}`, "max");
        revalidated.push(`author-${slug}`);
      }
    }

    // Unknown model fallback — bust all common tags
    if (!model) {
      revalidateTag("posts", "max");
      revalidateTag("categories", "max");
      revalidateTag("authors", "max");
      revalidated.push("posts", "categories", "authors");
    }

    console.log(
      `[Webhook] ✅ Revalidated — event: ${event ?? "unknown"}, model: ${model ?? "all"}, slug: ${slug ?? "n/a"}, tags: [${revalidated.join(", ")}]`
    );

    return NextResponse.json({
      revalidated: true,
      event,
      model,
      slug,
      tags: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Webhook] ❌ Error revalidating:", err);
    return NextResponse.json(
      { message: "Error processing webhook", error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "EduHub revalidation webhook is active",
    usage: "POST /api/revalidate with Authorization: Bearer <REVALIDATE_SECRET>",
    supportedModels: ["post", "category", "author"],
  });
}
