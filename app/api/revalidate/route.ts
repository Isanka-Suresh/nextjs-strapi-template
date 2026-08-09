import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  // Validate secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const model = body?.model as string | undefined;
    const slug = body?.entry?.slug as string | undefined;

    // Revalidate based on the content type that changed
    if (model === "post") {
      revalidatePath("/blog", "page");
      revalidatePath("/", "page");
      if (slug) {
        revalidatePath(`/blog/${slug}`, "page");
      }
    } else if (model === "category") {
      revalidatePath("/", "page");
      revalidatePath("/blog", "page");
      if (slug) {
        revalidatePath(`/category/${slug}`, "page");
      }
    } else if (model === "author") {
      if (slug) {
        revalidatePath(`/author/${slug}`, "page");
      }
    } else {
      // Fallback: revalidate all key paths
      revalidatePath("/", "layout");
      revalidatePath("/blog", "page");
    }

    console.log(`[Webhook] Revalidated model: ${model ?? "all"}, slug: ${slug ?? "n/a"}`);
    return NextResponse.json({
      revalidated: true,
      model,
      slug,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Webhook] Error processing webhook:", err);
    return NextResponse.json(
      { message: "Error processing webhook", error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Revalidation endpoint active" });
}
