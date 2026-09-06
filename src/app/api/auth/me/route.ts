import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED", message: "Login required" },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true, admin });
}
