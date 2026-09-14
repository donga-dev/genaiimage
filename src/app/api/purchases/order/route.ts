import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getRazorpayClient, getRazorpayKeys, rupeesToPaise } from "@/lib/razorpay";
import { serializePurchase } from "@/lib/serialize";
import { purchaseSchema } from "@/lib/validators";
import { Plan } from "@/models/Plan";
import { Purchase } from "@/models/Purchase";

export async function POST(request: Request) {
  try {
    const { admin, error } = await requireApiAdmin();
    if (error || !admin) return error;

    const keys = getRazorpayKeys();
    const razorpay = getRazorpayClient();
    if (!keys || !razorpay) {
      return NextResponse.json(
        {
          ok: false,
          error: "PAYMENTS_NOT_CONFIGURED",
          message: "Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(parsed.data.planId)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PLAN", message: "Plan not found" },
        { status: 404 },
      );
    }

    await connectDB();
    const plan = await Plan.findOne({ _id: parsed.data.planId, isActive: true });
    if (!plan) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PLAN", message: "Plan not found or inactive" },
        { status: 404 },
      );
    }

    const amountPaise = rupeesToPaise(plan.totalPrice);
    const receipt = `w_${admin.id.slice(-8)}_${Date.now().toString(36)}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        adminId: admin.id,
        planId: plan._id.toString(),
        planName: plan.name,
        model: plan.model || "genaiimg-v1",
      },
    });

    const purchase = await Purchase.create({
      adminId: admin.id,
      planId: plan._id,
      planName: `${plan.name} · ${plan.model || "genaiimg-v1"}`,
      credits: plan.credits,
      pricePerCredit: plan.pricePerCredit,
      amountPaid: plan.totalPrice,
      status: "pending",
      razorpayOrderId: order.id,
      purchasedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      keyId: keys.keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      purchase: serializePurchase(purchase),
    });
  } catch (error) {
    console.error("razorpay order failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not start Razorpay payment" },
      { status: 500 },
    );
  }
}
