import { NextRequest, NextResponse } from "next/server";
import { hashApiToken, readRequestApiToken } from "@/lib/api-tokens";
import { logCreditUse, refundReservation, reserveCredit } from "@/lib/credits";
import { connectDB } from "@/lib/db";
import { META_IMAGE_MODEL, META_IMAGE_PROMPT } from "@/lib/meta-image-prompt";
import { Admin } from "@/models/Admin";
import { ApiToken } from "@/models/ApiToken";

export const maxDuration = 60;
export const runtime = "nodejs";

const META_IMAGE_URL = "https://api.meta.ai/v1/images/edits";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key, x-user-email",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type IncomingBody = {
  image?: string;
  image_url?: string;
  image_base64?: string;
  images?: Array<{ image_url?: string } | string>;
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

function toImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `data:image/png;base64,${trimmed}`;
}

function readImage(body: IncomingBody) {
  if (typeof body.image === "string") return toImageUrl(body.image);
  if (typeof body.image_url === "string") return toImageUrl(body.image_url);
  if (typeof body.image_base64 === "string") return toImageUrl(body.image_base64);
  const first = body.images?.[0];
  if (typeof first === "string") return toImageUrl(first);
  if (first && typeof first.image_url === "string") return toImageUrl(first.image_url);
  return "";
}

function passthrough(meta: Response, extra?: Record<string, string>) {
  const headers = new Headers(CORS);
  const contentType = meta.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  }
  return headers;
}

export async function POST(request: NextRequest) {
  const token = readRequestApiToken(request);
  if (!token.startsWith("gai_") && !token.startsWith("lum_")) {
    return json(
      { ok: false, error: "UNAUTHORIZED", message: "Send your GenAI Img API key as Bearer or x-api-key." },
      401,
    );
  }

  const metaKey = process.env.META_API_KEY?.trim();
  if (!metaKey) {
    return json(
      {
        ok: false,
        error: "META_NOT_CONFIGURED",
        message: "Add META_API_KEY to the server env, then restart.",
      },
      503,
    );
  }

  let incoming: IncomingBody;
  try {
    incoming = (await request.json()) as IncomingBody;
  } catch {
    return json({ ok: false, error: "INVALID_INPUT", message: "JSON body is required." }, 400);
  }

  const imageUrl = readImage(incoming);
  if (!imageUrl) {
    return json({ ok: false, error: "INVALID_INPUT", message: "Send image as base64 in image or image_url." }, 400);
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

  let meta: Response;
  try {
    meta = await fetch(META_IMAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: META_IMAGE_MODEL,
        prompt: META_IMAGE_PROMPT,
        images: [{ image_url: imageUrl }],
        response_format: "b64_json",
      }),
      signal: AbortSignal.timeout(55_000),
    });
  } catch (error) {
    await refundReservation(admin._id.toString());
    console.error("meta image call failed", error);
    return json({ ok: false, error: "META_ERROR", message: "Image API did not respond." }, 502);
  }

  if (!meta.ok) {
    await refundReservation(admin._id.toString());
    return new NextResponse(await meta.arrayBuffer(), {
      status: meta.status,
      headers: passthrough(meta),
    });
  }

  await ApiToken.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() });
  await logCreditUse({
    adminId: admin._id.toString(),
    adminEmail: admin.email,
    userEmail: userEmailFrom(request, admin.email),
    remainingCredits: reserved.credits,
    source: "image",
  });

  return new NextResponse(await meta.arrayBuffer(), {
    status: 200,
    headers: passthrough(meta, { "x-credits-remaining": String(reserved.credits) }),
  });
}
