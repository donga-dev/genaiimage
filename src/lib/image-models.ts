export const IMAGE_MODELS = ["genaiimg-v1", "genaiimg-v2"] as const;

export type ImageModelId = (typeof IMAGE_MODELS)[number];

export function isImageModelId(value: string): value is ImageModelId {
  return IMAGE_MODELS.includes(value as ImageModelId);
}
