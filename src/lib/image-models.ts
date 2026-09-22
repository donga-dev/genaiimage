export const IMAGE_MODELS = ["genaiimg-v1", "genaiimg-v2", "genaiimg-v3"] as const;

export type ImageModelId = (typeof IMAGE_MODELS)[number];

export const OPENAI_IMAGE_MODEL = "gpt-image-2.5-sunburst";
export const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

export const GEMINI_ASPECT_RATIOS = [
  "1:1",
  "1:4",
  "1:8",
  "2:3",
  "3:2",
  "3:4",
  "4:1",
  "4:3",
  "4:5",
  "5:4",
  "8:1",
  "9:16",
  "16:9",
  "21:9",
] as const;

export type GeminiAspectRatio = (typeof GEMINI_ASPECT_RATIOS)[number];

export function isImageModelId(value: string): value is ImageModelId {
  return IMAGE_MODELS.includes(value as ImageModelId);
}

export function isGeminiAspectRatio(value: string): value is GeminiAspectRatio {
  return GEMINI_ASPECT_RATIOS.includes(value as GeminiAspectRatio);
}

export function creditField(model: ImageModelId): "creditsV1" | "creditsV2" | "creditsV3" {
  if (model === "genaiimg-v3") return "creditsV3";
  if (model === "genaiimg-v2") return "creditsV2";
  return "creditsV1";
}

export function parseImageModel(raw: string | null | undefined): ImageModelId | "" {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "genaiimg-v1" || value === "genaiimage-v1" || value === "v1") return "genaiimg-v1";
  if (value === "genaiimg-v2" || value === "genaiimage-v2" || value === "v2") return "genaiimg-v2";
  if (value === "genaiimg-v3" || value === "genaiimage-v3" || value === "v3") return "genaiimg-v3";
  return "";
}

export function readImageModel(request: Request): ImageModelId | "" {
  return parseImageModel(request.headers.get("x-model") || request.headers.get("x-version"));
}

export function splitCredits(admin: {
  credits?: number;
  creditsV1?: number;
  creditsV2?: number;
  creditsV3?: number;
}) {
  const storedV1 = admin.creditsV1 ?? 0;
  const storedV2 = admin.creditsV2 ?? 0;
  const storedV3 = admin.creditsV3 ?? 0;
  if (storedV1 === 0 && storedV2 === 0 && storedV3 === 0 && (admin.credits ?? 0) > 0) {
    return {
      creditsV1: admin.credits ?? 0,
      creditsV2: 0,
      creditsV3: 0,
      credits: admin.credits ?? 0,
    };
  }
  return {
    creditsV1: storedV1,
    creditsV2: storedV2,
    creditsV3: storedV3,
    credits: storedV1 + storedV2 + storedV3,
  };
}
