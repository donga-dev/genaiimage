import { NextRequest, NextResponse } from "next/server";
import { isSmtpConfigured } from "@/lib/mail";
import { requestPasswordReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";

const GENERIC = {
  ok: true,
  message: "If an account exists for that email, we sent a password reset link.",
};

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT", message: "Enter a valid email." }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Enter a valid email." },
      { status: 400 },
    );
  }

  const ip = clientIp(request);
  if (!rateLimit(`forgot:${ip}`) || !rateLimit(`forgot-email:${parsed.data.email}`)) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED", message: "Too many attempts. Try again in a little while." },
      { status: 429 },
    );
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { ok: false, error: "EMAIL_NOT_CONFIGURED", message: "Password reset email is not available right now." },
      { status: 503 },
    );
  }

  try {
    await requestPasswordReset(parsed.data.email);
  } catch {
    console.error("password reset request failed");
  }

  return NextResponse.json(GENERIC);
}
