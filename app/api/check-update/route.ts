import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/strapi";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
  }

  try {
    // This uses the cached fetch from strapi.ts, which is extremely fast and zero-cost 
    // unless the cache was busted by the webhook
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ updatedAt: post.updatedAt });
  } catch (err) {
    console.error("[CheckUpdate] Error checking post update:", err);
    return NextResponse.json(
      { error: "Failed to check update status" },
      { status: 500 }
    );
  }
}
