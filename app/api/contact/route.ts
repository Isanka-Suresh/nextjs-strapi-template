import { NextRequest, NextResponse } from "next/server";
import { submitContact } from "@/lib/strapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    await submitContact({ name, email, subject, message });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact API] Error:", err);
    return NextResponse.json(
      { message: "Failed to submit contact form." },
      { status: 500 }
    );
  }
}
