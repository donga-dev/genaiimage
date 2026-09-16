export const IMAGE_MODELS = ["genaiimg-v1", "genaiimg-v2"] as const;

export type ImageModelId = (typeof IMAGE_MODELS)[number];

export const OPENAI_IMAGE_MODEL = "gpt-image-2.5-sunburst";

export function isImageModelId(value: string): value is ImageModelId {
  return IMAGE_MODELS.includes(value as ImageModelId);
}

export function creditField(model: ImageModelId): "creditsV1" | "creditsV2" {
  return model === "genaiimg-v2" ? "creditsV2" : "creditsV1";
}

export function parseImageModel(raw: string | null | undefined): ImageModelId | "" {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "genaiimg-v1" || value === "genaiimage-v1" || value === "v1") return "genaiimg-v1";
  if (value === "genaiimg-v2" || value === "genaiimage-v2" || value === "v2") return "genaiimg-v2";
  return "";
}

export function readImageModel(request: Request): ImageModelId | "" {
  return parseImageModel(request.headers.get("x-model") || request.headers.get("x-version"));
}

export function splitCredits(admin: { credits?: number; creditsV1?: number; creditsV2?: number }) {
  const storedV1 = admin.creditsV1 ?? 0;
  const storedV2 = admin.creditsV2 ?? 0;
  if (storedV1 === 0 && storedV2 === 0 && (admin.credits ?? 0) > 0) {
    return { creditsV1: admin.credits ?? 0, creditsV2: 0, credits: admin.credits ?? 0 };
  }
  return { creditsV1: storedV1, creditsV2: storedV2, credits: storedV1 + storedV2 };
}

