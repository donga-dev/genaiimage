import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { createApiTokenValue, serializeApiToken } from "@/lib/api-tokens";
import { connectDB } from "@/lib/db";
import { apiKeyNameSchema } from "@/lib/validators";
import { ApiToken } from "@/models/ApiToken";

export async function GET() {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;

  await connectDB();
  const keys = await ApiToken.find({ adminId: admin.id, revokedAt: null }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    ok: true,
    keys: keys.map((key) => serializeApiToken(key)),
  });
}

export async function POST(request: Request) {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;

  let name = "API key";
  try {
    const body = await request.json();
    const parsed = apiKeyNameSchema.safeParse(body);
    if (parsed.success && parsed.data.name) name = parsed.data.name;
  } catch {
    /* empty body is fine */
  }

  await connectDB();
  const count = await ApiToken.countDocuments({ adminId: admin.id, revokedAt: null });
  const created = createApiTokenValue();
  const key = await ApiToken.create({
    adminId: admin.id,
    name: name === "API key" ? `API key ${count + 1}` : name,
    tokenHash: created.tokenHash,
    prefix: created.prefix,
    last4: created.last4,
  });

  return NextResponse.json({
    ok: true,
    token: created.token,
    key: serializeApiToken(key),
  });
}
