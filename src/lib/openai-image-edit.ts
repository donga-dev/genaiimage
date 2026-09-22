import { OPENAI_IMAGE_MODEL } from "@/lib/image-models";

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/edits";

function mimeFromUrl(value: string) {
  if (value.startsWith("data:image/jpeg") || value.startsWith("data:image/jpg")) return "image/jpeg";
  if (value.startsWith("data:image/webp")) return "image/webp";
  return "image/png";
}

function extensionFor(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

export async function imageUrlToFile(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const comma = imageUrl.indexOf(",");
    if (comma < 0) throw new Error("Invalid data URL");
    const mime = mimeFromUrl(imageUrl);
    const bytes = Buffer.from(imageUrl.slice(comma + 1), "base64");
    return new File([bytes], `image.${extensionFor(mime)}`, { type: mime });
  }

  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error("Could not download source image");
  const mime = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
  const bytes = Buffer.from(await response.arrayBuffer());
  return new File([bytes], `image.${extensionFor(mime)}`, { type: mime });
}

export async function editImageWithOpenAI(input: {
  imageUrl: string;
  prompt: string;
  apiKey: string;
  size: string;
}) {
  const file = await imageUrlToFile(input.imageUrl);
  const form = new FormData();
  form.append("image[]", file);
  form.append("prompt", input.prompt);
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("quality", "auto");
  form.append("size", input.size);
  form.append("output_format", "png");

  return fetch(OPENAI_IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: form,
    signal: AbortSignal.timeout(55_000),
  });
}

/** Normalize OpenAI edits JSON to Meta-compatible `{ data: [{ b64_json }] }`. */
export async function openAIEditToB64Json(upstream: Response) {
  const payload = (await upstream.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
    error?: { message?: string };
  };

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  const first = payload.data?.[0];
  if (first?.b64_json) {
    return { data: [{ b64_json: first.b64_json }] };
  }

  if (first?.url) {
    const image = await fetch(first.url, { signal: AbortSignal.timeout(20_000) });
    if (!image.ok) throw new Error("Could not download OpenAI result image");
    const b64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    return { data: [{ b64_json: b64 }] };
  }

  throw new Error("OpenAI response missing image data");
}
