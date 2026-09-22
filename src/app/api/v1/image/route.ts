import { NextRequest, NextResponse } from "next/server";
import { hashApiToken, readRequestApiToken } from "@/lib/api-tokens";
import { logCreditUse, refundReservation, reserveCredit } from "@/lib/credits";
import { connectDB } from "@/lib/db";
import { geminiEditToB64Json, editImageWithGemini } from "@/lib/gemini-image-edit";
import { isGeminiAspectRatio, readImageModel, type GeminiAspectRatio } from "@/lib/image-models";
import { META_IMAGE_MODEL } from "@/lib/meta-image-prompt";
import { editImageWithOpenAI, openAIEditToB64Json } from "@/lib/openai-image-edit";
import { Admin } from "@/models/Admin";
import { ApiToken } from "@/models/ApiToken";

export const maxDuration = 60;
export const runtime = "nodejs";

const META_IMAGE_URL = "https://api.meta.ai/v1/images/edits";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key, x-user-email, x-model, x-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type IncomingBody = {
  image?: string;
  image_url?: string;
  image_base64?: string;
  images?: Array<{ image_url?: string } | string>;
  prompt?: string;
  size?: string;
  aspectRatio?: string;
  aspect_ratio?: string;
};

const SIZE_RE = /^\d{2,5}x\d{2,5}$/i;

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

function readPrompt(body: IncomingBody) {
  return typeof body.prompt === "string" ? body.prompt.trim() : "";
}

function readSize(body: IncomingBody) {
  return typeof body.size === "string" ? body.size.trim() : "";
}

function readAspectRatio(body: IncomingBody) {
  const raw =
    (typeof body.aspectRatio === "string" && body.aspectRatio) ||
    (typeof body.aspect_ratio === "string" && body.aspect_ratio) ||
    "";
  return raw.trim();
}

function passthrough(upstream: Response, extra?: Record<string, string>) {
  const headers = new Headers(CORS);
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  }
  return headers;
}

async function callMeta(imageUrl: string, prompt: string, metaKey: string) {
  return fetch(META_IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${metaKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: META_IMAGE_MODEL,
      prompt,
      images: [{ image_url: imageUrl }],
      response_format: "b64_json",
    }),
    signal: AbortSignal.timeout(55_000),
  });
}

export async function POST(request: NextRequest) {
  const token = readRequestApiToken(request);
  if (!token.startsWith("gai_") && !token.startsWith("lum_")) {
    return json(
      { ok: false, error: "UNAUTHORIZED", message: "Send your GenAI Img API key as Bearer or x-api-key." },
      401,
    );
  }

  const model = readImageModel(request);
  if (!model) {
    return json(
      {
        ok: false,
        error: "INVALID_INPUT",
        message: "Send x-model as genaiimg-v1, genaiimg-v2, or genaiimg-v3.",
      },
      400,
    );
  }

  if (model === "genaiimg-v1" && !process.env.META_API_KEY?.trim()) {
    return json(
      {
        ok: false,
        error: "META_NOT_CONFIGURED",
        message: "Add META_API_KEY to the server env, then restart.",
      },
      503,
    );
  }

  if (model === "genaiimg-v2" && !process.env.OPENAI_API_KEY?.trim()) {
    return json(
      {
        ok: false,
        error: "OPENAI_NOT_CONFIGURED",
        message: "Add OPENAI_API_KEY to the server env, then restart.",
      },
      503,
    );
  }

  if (model === "genaiimg-v3" && !process.env.GEMINI_API_KEY?.trim()) {
    return json(
      {
        ok: false,
        error: "GEMINI_NOT_CONFIGURED",
        message: "Add GEMINI_API_KEY to the server env, then restart.",
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

  const prompt = readPrompt(incoming);
  if (!prompt) {
    return json({ ok: false, error: "INVALID_INPUT", message: "Send prompt in the JSON body." }, 400);
  }
  if (prompt.length > 16_000) {
    return json({ ok: false, error: "INVALID_INPUT", message: "Prompt is too long." }, 400);
  }

  const size = readSize(incoming);
  if (model === "genaiimg-v2") {
    if (!size) {
      return json(
        { ok: false, error: "INVALID_INPUT", message: "Send size in the JSON body for genaiimg-v2 (e.g. 944x816)." },
        400,
      );
    }
    if (!SIZE_RE.test(size)) {
      return json(
        { ok: false, error: "INVALID_INPUT", message: "size must look like WIDTHxHEIGHT (e.g. 944x816)." },
        400,
      );
    }
  }

  let aspectRatio: GeminiAspectRatio | null = null;
  if (model === "genaiimg-v3") {
    const rawAspect = readAspectRatio(incoming);
    if (!rawAspect) {
      return json(
        {
          ok: false,
          error: "INVALID_INPUT",
          message: "Send aspectRatio in the JSON body for genaiimg-v3 (e.g. 5:4).",
        },
        400,
      );
    }
    if (!isGeminiAspectRatio(rawAspect)) {
      return json(
        {
          ok: false,
          error: "INVALID_INPUT",
          message:
            "aspectRatio must be one of 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9.",
        },
        400,
      );
    }
    aspectRatio = rawAspect;
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

  const reserved = await reserveCredit(admin._id.toString(), admin.email, model);
  if (!reserved.ok) {
    if (reserved.reason === "no_credits") {
      return json(
        {
          ok: false,
          error: "INSUFFICIENT_CREDITS",
          message: `No ${model} credits remaining. Buy a ${model} pack to continue.`,
          model,
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
    if (model === "genaiimg-v3") {
      upstream = await editImageWithGemini({
        imageUrl,
        prompt,
        aspectRatio: aspectRatio!,
        apiKey: process.env.GEMINI_API_KEY!.trim(),
      });
    } else if (model === "genaiimg-v2") {
      upstream = await editImageWithOpenAI({
        imageUrl,
        prompt,
        size,
        apiKey: process.env.OPENAI_API_KEY!.trim(),
      });
    } else {
      upstream = await callMeta(imageUrl, prompt, process.env.META_API_KEY!.trim());
    }
  } catch (error) {
    await refundReservation(admin._id.toString(), model);
    console.error(`${model} image call failed`, error);
    return json({ ok: false, error: "UPSTREAM_ERROR", message: "Image API did not respond." }, 502);
  }

  if (!upstream.ok) {
    await refundReservation(admin._id.toString(), model);
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: passthrough(upstream),
    });
  }

  let successBody: ArrayBuffer | string;
  if (model === "genaiimg-v2" || model === "genaiimg-v3") {
    try {
      const normalized =
        model === "genaiimg-v3" ? await geminiEditToB64Json(upstream) : await openAIEditToB64Json(upstream);
      successBody = JSON.stringify(normalized);
    } catch (error) {
      await refundReservation(admin._id.toString(), model);
      console.error(`${model} b64 normalize failed`, error);
      return json({ ok: false, error: "UPSTREAM_ERROR", message: "Image API returned an invalid result." }, 502);
    }
  } else {
    successBody = await upstream.arrayBuffer();
  }

  await ApiToken.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() });
  await logCreditUse({
    adminId: admin._id.toString(),
    adminEmail: admin.email,
    userEmail: userEmailFrom(request, admin.email),
    remainingCredits: reserved.credits,
    source: "image",
    model,
  });

  const headers = passthrough(upstream, {
    "x-credits-remaining": String(reserved.credits),
    "x-model": model,
  });
  if (model === "genaiimg-v2" || model === "genaiimg-v3") {
    headers.set("content-type", "application/json");
  }

  return new NextResponse(successBody, {
    status: 200,
    headers,
  });
}
