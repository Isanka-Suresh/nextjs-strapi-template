import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;


function verifySecret(req: NextRequest): boolean {
  // Check query-param secret (e.g., ?secret=xxx)
  const querySecret = req.nextUrl.searchParams.get("secret");
  if (querySecret && querySecret === REVALIDATE_SECRET) return true;

  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === REVALIDATE_SECRET) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ message: "Unauthorized — invalid secret" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  // Strapi webhook payload shape:
  // { event: "entry.publish", model: "post", entry: { slug: "...", ... } }
  const event = body?.event as string | undefined;
  const model = body?.model as string | undefined;
  const entry = body?.entry as Record<string, unknown> | undefined;
  const slug = entry?.slug as string | undefined;

  try {
    if (model === "post" || !model) {
      // Invalidate all post-related tags
      revalidateTag("posts", "default");
      if (slug) revalidateTag(`post-${slug}`, "default");

      // Also invalidate paths for ISR
      revalidatePath("/", "page");
      revalidatePath("/blog", "page");
      if (slug) revalidatePath(`/blog/${slug}`, "page");
    }

    if (model === "category") {
      revalidateTag("categories", "default");
      revalidatePath("/", "page");
      revalidatePath("/blog", "page");
      if (slug) {
        revalidateTag(`category-${slug}`, "default");
        revalidatePath(`/category/${slug}`, "page");
      }
    }

    if (model === "author") {
      revalidateTag("authors", "default");
      if (slug) {
        revalidatePath(`/author/${slug}`, "page");
      }
    }

    // Fallback for unknown models — bust everything
    if (!model) {
      revalidateTag("posts", "default");
      revalidateTag("categories", "default");
      revalidateTag("authors", "default");
      revalidatePath("/", "layout");
    }

    console.log(
      `[Webhook] ✅ Revalidated — event: ${event ?? "unknown"}, model: ${model ?? "all"}, slug: ${slug ?? "n/a"}`
    );

    return NextResponse.json({
      revalidated: true,
      event,
      model,
      slug,
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
    usage: "POST /api/revalidate?secret=<REVALIDATE_SECRET>",
  });
}

