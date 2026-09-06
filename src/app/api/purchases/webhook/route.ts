import { NextRequest, NextResponse } from "next/server";
import { fulfillPaidPurchase } from "@/lib/fulfill-purchase";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
};

type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json(
      { ok: false, error: "WEBHOOK_NOT_CONFIGURED", message: "RAZORPAY_WEBHOOK_SECRET is not set" },
      { status: 503 },
    );
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_SIGNATURE", message: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  let payload: RazorpayWebhookBody;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", message: "Invalid webhook body" },
      { status: 400 },
    );
  }

  const event = payload.event ?? "";
  if (event !== "payment.captured" && event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD", message: "Payment entity missing" },
      { status: 400 },
    );
  }

  const result = await fulfillPaidPurchase({
    razorpayOrderId: payment.order_id,
    razorpayPaymentId: payment.id,
    expectedAmountPaise: typeof payment.amount === "number" ? payment.amount : undefined,
  });

  if (!result.ok && result.status !== 404) {
    return NextResponse.json(
      { ok: false, error: result.error, message: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    fulfilled: result.ok && !result.alreadyFulfilled,
  });
}
