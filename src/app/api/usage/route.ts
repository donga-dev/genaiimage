import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializeUsage } from "@/lib/serialize";
import { Usage } from "@/models/Usage";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const filter: Record<string, unknown> = { adminId: admin.id };
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.$gte = new Date(`${from}T00:00:00+05:30`);
    if (to) createdAt.$lte = new Date(`${to}T23:59:59.999+05:30`);
    filter.createdAt = createdAt;
  }
  if (q) {
    filter.userEmail = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  await connectDB();
  const [items, total] = await Promise.all([
    Usage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Usage.countDocuments(filter),
  ]);

  return NextResponse.json({
    ok: true,
    items: items.map(serializeUsage),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
