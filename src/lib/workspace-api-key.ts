import { hashApiToken, readRequestApiToken } from "@/lib/api-tokens";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { ApiToken } from "@/models/ApiToken";

export function isWorkspaceApiKey(token: string) {
  return token.startsWith("gai_") || token.startsWith("lum_");
}

export function readWorkspaceApiKey(request: Request) {
  return readRequestApiToken(request);
}

export async function findWorkspaceByApiKey(token: string) {
  if (!isWorkspaceApiKey(token)) return null;

  await connectDB();
  const apiKey = await ApiToken.findOne({ tokenHash: hashApiToken(token), revokedAt: null });
  if (!apiKey) return null;

  const admin = await Admin.findById(apiKey.adminId).lean();
  if (!admin) return null;

  return { admin, apiKey };
}
