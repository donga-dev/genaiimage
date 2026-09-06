import { createHash, randomBytes } from "crypto";
import type { ApiTokenDoc } from "@/models/ApiToken";

export function hashApiToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createApiTokenValue() {
  const token = `lum_${randomBytes(24).toString("base64url")}`;
  return {
    token,
    tokenHash: hashApiToken(token),
    prefix: token.slice(0, 11),
    last4: token.slice(-4),
  };
}

export function readRequestApiToken(request: Request) {
  return (
    request.headers.get("x-api-key")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    ""
  );
}

export function maskedToken(prefix: string, last4: string) {
  return `${prefix}••••${last4}`;
}

export function serializeApiToken(doc: ApiTokenDoc & { _id: { toString(): string } }) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    masked: maskedToken(doc.prefix, doc.last4),
    lastUsedAt: doc.lastUsedAt ? doc.lastUsedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  };
}
