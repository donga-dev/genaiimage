import type { HydratedDocument } from "mongoose";
import { creditField, isImageModelId, type ImageModelId } from "@/lib/image-models";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { Plan } from "@/models/Plan";
import { Purchase, type PurchaseDoc } from "@/models/Purchase";

type FulfillResult =
  | { ok: true; alreadyFulfilled: boolean; purchase: HydratedDocument<PurchaseDoc> }
  | { ok: false; status: number; error: string; message: string };

export async function fulfillPaidPurchase(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
  expectedAdminId?: string;
  expectedAmountPaise?: number;
}): Promise<FulfillResult> {
  await connectDB();

  const existing = await Purchase.findOne({ razorpayOrderId: input.razorpayOrderId });
  if (!existing) {
    return { ok: false, status: 404, error: "ORDER_NOT_FOUND", message: "Payment order not found" };
  }

  if (input.expectedAdminId && existing.adminId.toString() !== input.expectedAdminId) {
    return {
      ok: false,
      status: 403,
      error: "FORBIDDEN",
      message: "This payment does not belong to the signed-in admin",
    };
  }

  if (
    typeof input.expectedAmountPaise === "number" &&
    Math.round(existing.amountPaid * 100) !== input.expectedAmountPaise
  ) {
    return {
      ok: false,
      status: 400,
      error: "AMOUNT_MISMATCH",
      message: "Paid amount does not match the selected pack",
    };
  }

  if (existing.status === "completed") {
    return { ok: true, alreadyFulfilled: true, purchase: existing };
  }

  const now = new Date();
  const purchase = await Purchase.findOneAndUpdate(
    { razorpayOrderId: input.razorpayOrderId, status: "pending" },
    {
      $set: {
        status: "completed",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature ?? null,
        purchasedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  if (!purchase) {
    const raced = await Purchase.findOne({ razorpayOrderId: input.razorpayOrderId });
    if (raced?.status === "completed") {
      return { ok: true, alreadyFulfilled: true, purchase: raced };
    }
    return { ok: false, status: 409, error: "ORDER_NOT_PAYABLE", message: "This order cannot be completed" };
  }

  const fromPurchase = isImageModelId(purchase.model ?? "") ? (purchase.model as ImageModelId) : "";
  const planModel = (await Plan.findById(purchase.planId).lean())?.model;
  const fromPlan = isImageModelId(planModel ?? "") ? (planModel as ImageModelId) : "genaiimg-v1";
  const model: ImageModelId = fromPurchase || fromPlan;
  const field = creditField(model);

  await Admin.findByIdAndUpdate(purchase.adminId, {
    $inc: { [field]: purchase.credits, credits: purchase.credits },
    $set: { lastPurchaseDate: now, currentPlanId: purchase.planId },
  });

  return { ok: true, alreadyFulfilled: false, purchase };
}
