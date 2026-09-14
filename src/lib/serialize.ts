import type { PublicAdmin, PublicPlan, PublicPurchase, PublicUsage } from "@/types";
import type { PlanDoc } from "@/models/Plan";

type LeanAdmin = {
  _id: { toString(): string };
  name: string;
  companyName: string;
  email: string;
  phone: string;
  credits: number;
  lastPurchaseDate?: Date | null;
  currentPlanId?: unknown;
  createdAt: Date;
};

type LeanPlan = PlanDoc & { _id: { toString(): string } };

function isPopulatedPlan(value: unknown): value is LeanPlan {
  return Boolean(value && typeof value === "object" && "slug" in value && "_id" in value);
}

type LeanPurchase = {
  _id: { toString(): string };
  planName: string;
  credits: number;
  pricePerCredit: number;
  amountPaid: number;
  status: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  purchasedAt: Date;
};

type LeanUsage = {
  _id: { toString(): string };
  userEmail: string;
  creditsUsed: number;
  remainingCredits: number;
  source?: string | null;
  createdAt: Date;
};

export function serializePlan(plan: LeanPlan): PublicPlan {
  return {
    id: plan._id.toString(),
    slug: plan.slug,
    name: plan.name,
    model: plan.model || "genaiimg-v1",
    description: plan.description,
    credits: plan.credits,
    pricePerCredit: plan.pricePerCredit,
    totalPrice: plan.totalPrice,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
  };
}

export function serializeAdmin(admin: LeanAdmin): PublicAdmin {
  const plan = isPopulatedPlan(admin.currentPlanId) ? admin.currentPlanId : null;

  return {
    id: admin._id.toString(),
    name: admin.name,
    companyName: admin.companyName,
    email: admin.email,
    phone: admin.phone,
    credits: admin.credits,
    lastPurchaseDate: admin.lastPurchaseDate ? admin.lastPurchaseDate.toISOString() : null,
    currentPlan: plan ? serializePlan(plan) : null,
    createdAt: admin.createdAt.toISOString(),
  };
}

export function serializePurchase(purchase: LeanPurchase): PublicPurchase {
  return {
    id: purchase._id.toString(),
    planName: purchase.planName,
    credits: purchase.credits,
    pricePerCredit: purchase.pricePerCredit,
    amountPaid: purchase.amountPaid,
    status: purchase.status,
    razorpayOrderId: purchase.razorpayOrderId ?? null,
    razorpayPaymentId: purchase.razorpayPaymentId ?? null,
    purchasedAt: new Date(purchase.purchasedAt).toISOString(),
  };
}

export function serializeUsage(usage: LeanUsage): PublicUsage {
  return {
    id: usage._id.toString(),
    userEmail: usage.userEmail,
    creditsUsed: usage.creditsUsed,
    remainingCredits: usage.remainingCredits,
    source: usage.source ?? null,
    createdAt: usage.createdAt.toISOString(),
  };
}
