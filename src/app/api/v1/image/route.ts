import { NextRequest, NextResponse } from "next/server";
import { hashApiToken, readRequestApiToken } from "@/lib/api-tokens";
import { logCreditUse, refundReservation, reserveCredit } from "@/lib/credits";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { ApiToken } from "@/models/ApiToken";

export const maxDuration = 60;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key, x-user-email",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CORS });
}

function userEmailFrom(request: NextRequest, fallback: string) {
  const raw = request.headers.get("x-user-email")?.trim().toLowerCase() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : fallback;
}

function upstreamHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const upstreamKey = process.env.UPSTREAM_IMAGE_API_KEY?.trim();
  if (upstreamKey) headers.set("authorization", `Bearer ${upstreamKey}`);

  return headers;
}

export async function POST(request: NextRequest) {
  const token = readRequestApiToken(request);
  if (!token.startsWith("lum_")) {
    return json({ ok: false, error: "UNAUTHORIZED", message: "Send your Lumina API key as Bearer or x-api-key." }, 401);
  }

  const upstreamUrl = process.env.UPSTREAM_IMAGE_API_URL?.trim();
  if (!upstreamUrl) {
    return json(
      {
        ok: false,
        error: "UPSTREAM_NOT_CONFIGURED",
        message: "Add UPSTREAM_IMAGE_API_URL to .env.local, then restart the server.",
      },
      503,
    );
  }

  await connectDB();
  const apiKey = await ApiToken.findOne({ tokenHash: hashApiToken(token), revokedAt: null });
  if (!apiKey) {
    return json({ ok: false, error: "UNAUTHORIZED", message: "Invalid API key" }, 401);
  }

  const admin = await Admin.findById(apiKey.adminId).lean();
  if (!admin) {
    return json({ ok: false, error: "ADMIN_NOT_FOUND", message: "Workspace not found" }, 404);
  }

  const reserved = await reserveCredit(admin._id.toString(), admin.email);
  if (!reserved.ok) {
    if (reserved.reason === "no_credits") {
      return json(
        {
          ok: false,
          error: "INSUFFICIENT_CREDITS",
          message: "No credits remaining. Purchase a credit pack to continue.",
          credits: 0,
          hasCredits: false,
        },
        402,
      );
    }
    return json({ ok: false, error: "ADMIN_NOT_FOUND", message: "Workspace not found" }, 404);
  }

  let upstream: Response;
  try {
    const target = new URL(upstreamUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!target.searchParams.has(key)) target.searchParams.set(key, value);
    });

    const payload = await request.arrayBuffer();
    upstream = await fetch(target, {
      method: "POST",
      headers: upstreamHeaders(request),
      body: payload.byteLength ? payload : undefined,
      signal: AbortSignal.timeout(55_000),
    });
  } catch (error) {
    await refundReservation(admin._id.toString());
    console.error("upstream image call failed", error);
    return json({ ok: false, error: "UPSTREAM_ERROR", message: "Image API did not respond." }, 502);
  }

  if (!upstream.ok) {
    await refundReservation(admin._id.toString());
    const failBody = await upstream.arrayBuffer();
    const headers = new Headers(CORS);
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    return new NextResponse(failBody, { status: upstream.status, headers });
  }

  await ApiToken.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() });
  await logCreditUse({
    adminId: admin._id.toString(),
    adminEmail: admin.email,
    userEmail: userEmailFrom(request, admin.email),
    remainingCredits: reserved.credits,
    source: "image",
  });

  const body = await upstream.arrayBuffer();
  const headers = new Headers(CORS);
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("x-credits-remaining", String(reserved.credits));
  return new NextResponse(body, { status: 200, headers });
}
