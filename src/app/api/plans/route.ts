import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializePlan } from "@/lib/serialize";
import { Plan } from "@/models/Plan";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;
  await connectDB();
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, pricePerCredit: -1 }).lean();
  return NextResponse.json({ ok: true, plans: plans.map(serializePlan) });
}
