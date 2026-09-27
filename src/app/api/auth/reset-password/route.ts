import { NextRequest, NextResponse } from "next/server";
import { forgetAdminCache } from "@/lib/auth";
import { forgetAdminPortalCache } from "@/lib/portal-cache";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validators";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT", message: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "This reset link is invalid or has expired.",
      },
      { status: 400 },
    );
  }

  if (!rateLimit(`reset:${clientIp(request)}`)) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED", message: "Too many attempts. Try again in a little while." },
      { status: 429 },
    );
  }

  try {
    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "INVALID_TOKEN", message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    forgetAdminCache(result.adminId);
    forgetAdminPortalCache(result.adminId);
    return NextResponse.json({
      ok: true,
      message: "Password updated. You can sign in with the new password.",
    });
  } catch {
    console.error("password reset failed");
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not reset the password." },
      { status: 500 },
    );
  }
}
