import { NextRequest, NextResponse } from "next/server";
import { findWorkspaceByApiKey, isWorkspaceApiKey, readWorkspaceApiKey } from "@/lib/workspace-api-key";
import { ApiToken } from "@/models/ApiToken";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key",
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

  const credits = resolved.admin.credits;
  return json({
    ok: true,
    credits,
    hasCredits: credits > 0,
  }, 200);
}

export async function GET(request: NextRequest) {
  return checkCredits(request);
}

export async function POST(request: NextRequest) {
  return checkCredits(request);
}
