import sharp from "sharp";

/** Lossless PNG recompress. Dimensions and pixel values stay the same. */
export async function compressImageLossless(b64: string) {
  const input = Buffer.from(b64, "base64");
  try {
    const output = await sharp(input, { limitInputPixels: false })
      .png({ compressionLevel: 9, effort: 10, palette: false })
      .toBuffer();
    return (output.length < input.length ? output : input).toString("base64");
  } catch {
    return b64;
  }
}
