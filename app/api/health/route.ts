import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      revision: process.env.RELEASE_SHA ?? "local",
      supportConfigured: Boolean(process.env.WEB3FORMS_ACCESS_KEY),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
