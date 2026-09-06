import { NextRequest, NextResponse } from "next/server";

export function requireInternalToken(request: NextRequest) {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "SERVER_MISCONFIGURED", message: "INTERNAL_API_TOKEN is not set" },
      { status: 503 },
    );
  }

  const headerToken =
    request.headers.get("x-internal-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!headerToken || headerToken !== expected) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED", message: "Invalid internal token" },
      { status: 401 },
    );
  }

  return null;
}
