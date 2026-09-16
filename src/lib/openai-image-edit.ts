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

export async function editImageWithOpenAI(input: { imageUrl: string; prompt: string; apiKey: string }) {
  const file = await imageUrlToFile(input.imageUrl);
  const form = new FormData();
  form.append("image", file);
  form.append("prompt", input.prompt);
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("quality", "high");
  form.append("size", "1536x1024");
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
