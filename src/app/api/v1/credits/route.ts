import { NextRequest, NextResponse } from "next/server";
import { splitCredits, readImageModel } from "@/lib/image-models";
import { findWorkspaceByApiKey, isWorkspaceApiKey, readWorkspaceApiKey } from "@/lib/workspace-api-key";
import { ApiToken } from "@/models/ApiToken";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key, x-model, x-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CORS });
}

async function checkCredits(request: NextRequest) {
  const token = readWorkspaceApiKey(request);
  if (!isWorkspaceApiKey(token)) {
    return json(
      { ok: false, error: "UNAUTHORIZED", message: "Send your GenAI Img API key as Bearer or x-api-key." },
      401,
    );
  }

  const resolved = await findWorkspaceByApiKey(token);
  if (!resolved) {
    return json({ ok: false, error: "UNAUTHORIZED", message: "Invalid API key" }, 401);
  }

  await ApiToken.findByIdAndUpdate(resolved.apiKey._id, { lastUsedAt: new Date() });

  const split = splitCredits(resolved.admin);
  const requested = readImageModel(request);
  const remaining = requested
    ? requested === "genaiimg-v3"
      ? split.creditsV3
      : requested === "genaiimg-v2"
        ? split.creditsV2
        : split.creditsV1
    : undefined;

  return json(
    {
      ok: true,
      credits: {
        "genaiimg-v1": split.creditsV1,
        "genaiimg-v2": split.creditsV2,
        "genaiimg-v3": split.creditsV3,
      },
      hasCredits: {
        "genaiimg-v1": split.creditsV1 > 0,
        "genaiimg-v2": split.creditsV2 > 0,
        "genaiimg-v3": split.creditsV3 > 0,
      },
      ...(requested
        ? { model: requested, remaining, hasModelCredits: (remaining ?? 0) > 0 }
        : {}),
    },
    200,
  );
}

export async function GET(request: NextRequest) {
  return checkCredits(request);
}

export async function POST(request: NextRequest) {
  return checkCredits(request);
}
