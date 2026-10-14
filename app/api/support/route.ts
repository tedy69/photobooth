import { NextRequest, NextResponse } from "next/server";
import { deliverSupport, validateSupport } from "@/lib/support";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host"))
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "JSON required" }, { status: 415 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 12000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const fields = validateSupport(body);
  if (!fields)
    return NextResponse.json(
      { error: "Valid name, email, subject and message are required" },
      { status: 400 },
    );
  if (typeof body === "object" && body && "website" in body && body.website)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key)
    return NextResponse.json(
      { error: "Email service unavailable. Please use direct email." },
      { status: 503 },
    );
  try {
    const sent = await deliverSupport(
      fields,
      key,
      process.env.SUPPORT_EMAIL ?? "gmail@tedyfazrin.com",
    );
    if (!sent)
      return NextResponse.json(
        { error: "Message delivery failed. Please retry." },
        { status: 502 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Message delivery failed. Please retry." },
      { status: 502 },
    );
  }
}
