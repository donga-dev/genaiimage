import { GEMINI_IMAGE_MODEL, type GeminiAspectRatio } from "@/lib/image-models";

const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

function mimeFromUrl(value: string) {
  if (value.startsWith("data:image/jpeg") || value.startsWith("data:image/jpg")) return "image/jpeg";
  if (value.startsWith("data:image/webp")) return "image/webp";
  if (value.startsWith("data:image/png")) return "image/png";
  return "image/jpeg";
}

async function imageUrlToBase64(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const comma = imageUrl.indexOf(",");
    if (comma < 0) throw new Error("Invalid data URL");
    return {
      mimeType: mimeFromUrl(imageUrl),
      data: imageUrl.slice(comma + 1).replace(/\s/g, ""),
    };
  }

  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error("Could not download source image");
  const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  const data = Buffer.from(await response.arrayBuffer()).toString("base64");
  return { mimeType, data };
}

export async function editImageWithGemini(input: {
  imageUrl: string;
  prompt: string;
  aspectRatio: GeminiAspectRatio;
  apiKey: string;
}) {
  const { mimeType, data } = await imageUrlToBase64(input.imageUrl);

  return fetch(GEMINI_INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": input.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GEMINI_IMAGE_MODEL,
      input: [
        { type: "text", text: input.prompt },
        { type: "image", mime_type: mimeType, data },
      ],
      response_format: {
        type: "image",
        aspect_ratio: input.aspectRatio,
        image_size: "1K",
      },
    }),
    signal: AbortSignal.timeout(55_000),
  });
}

type GeminiContent = {
  type?: string;
  data?: string;
  mime_type?: string;
};

type GeminiPayload = {
  status?: string;
  error?: { message?: string };
  outputs?: GeminiContent[];
  output?: GeminiContent[];
  output_image?: { data?: string; mime_type?: string };
  steps?: Array<{ type?: string; content?: GeminiContent[] }>;
};

function firstImageData(payload: GeminiPayload) {
  if (payload.output_image?.data) return payload.output_image.data;

  for (const block of payload.outputs ?? payload.output ?? []) {
    if (block.type === "image" && block.data) return block.data;
  }

  for (const step of payload.steps ?? []) {
    for (const block of step.content ?? []) {
      if (block.type === "image" && block.data) return block.data;
    }
  }

  return "";
}

/** Normalize Gemini interactions JSON to Meta-compatible `{ data: [{ b64_json }] }`. */
export async function geminiEditToB64Json(upstream: Response) {
  const payload = (await upstream.json()) as GeminiPayload;

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  const b64 = firstImageData(payload)?.replace(/\s/g, "") ?? "";
  if (!b64) {
    throw new Error("Gemini response missing image data");
  }

  return { data: [{ b64_json: b64 }] };
}
