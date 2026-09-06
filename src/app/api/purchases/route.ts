import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializePurchase } from "@/lib/serialize";
import { Purchase } from "@/models/Purchase";

export async function GET() {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;
  await connectDB();
  const purchases = await Purchase.find({ adminId: admin.id }).sort({ purchasedAt: -1 }).lean();
  return NextResponse.json({ ok: true, purchases: purchases.map(serializePurchase) });
}
