import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { fulfillPaidPurchase } from "@/lib/fulfill-purchase";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { serializePurchase } from "@/lib/serialize";
import { verifyPaymentSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { admin, error } = await requireApiAdmin();
    if (error || !admin) return error;

    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const valid = verifyCheckoutSignature({
      orderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "INVALID_SIGNATURE", message: "Payment signature could not be verified" },
        { status: 400 },
      );
    }

    const result = await fulfillPaidPurchase({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
      expectedAdminId: admin.id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      alreadyFulfilled: result.alreadyFulfilled,
      creditsAdded: result.alreadyFulfilled ? 0 : result.purchase.credits,
      purchase: serializePurchase(result.purchase),
    });
  } catch (error) {
    console.error("razorpay verify failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not verify payment" },
      { status: 500 },
    );
  }
}
