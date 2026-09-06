import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";

export function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function getRazorpayClient() {
  const keys = getRazorpayKeys();
  if (!keys) return null;
  return new Razorpay({
    key_id: keys.keyId,
    key_secret: keys.keySecret,
  });
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const keys = getRazorpayKeys();
  if (!keys) return false;
  const expected = createHmac("sha256", keys.keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export function rupeesToPaise(rupees: number) {
  return Math.round(rupees * 100);
}
