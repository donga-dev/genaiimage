import { Types } from "mongoose";
import { addDays, startOfDayIST, toISODateIST } from "@/lib/utils";
import { Purchase } from "@/models/Purchase";
import { Usage } from "@/models/Usage";
import { serializePurchase, serializeUsage } from "@/lib/serialize";

export async function getDashboardData(adminId: string) {
  const today = startOfDayIST();
  const from = addDays(today, -13);
  const id = new Types.ObjectId(adminId);

  const [todayHits, totalHits, daily, recentUsage, lastPurchase] = await Promise.all([
    Usage.countDocuments({ adminId: id, createdAt: { $gte: today } }),
    Usage.countDocuments({ adminId: id }),
    Usage.aggregate<{ _id: string; hits: number }>([
      { $match: { adminId: id, createdAt: { $gte: from } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
          },
          hits: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Usage.find({ adminId: id }).sort({ createdAt: -1 }).limit(8).lean(),
    Purchase.findOne({ adminId: id, status: "completed" }).sort({ purchasedAt: -1 }).lean(),
  ]);

  const hitsByDay = new Map(daily.map((row) => [row._id, row.hits]));
  const chart = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(from, index);
    const key = toISODateIST(date);
    return {
      date: key,
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
      hits: hitsByDay.get(key) ?? 0,
    };
  });

  return {
    todayHits,
    totalHits,
    chart,
    recentUsage: recentUsage.map(serializeUsage),
    lastPurchase: lastPurchase ? serializePurchase(lastPurchase) : null,
  };
}

export async function getUsagePageData(
  adminId: string,
  options: { from?: string; to?: string; q?: string; page?: number },
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = 20;
  const filter: Record<string, unknown> = { adminId: new Types.ObjectId(adminId) };

  if (options.from || options.to) {
    const createdAt: Record<string, Date> = {};
    if (options.from) createdAt.$gte = new Date(`${options.from}T00:00:00+05:30`);
    if (options.to) createdAt.$lte = new Date(`${options.to}T23:59:59.999+05:30`);
    filter.createdAt = createdAt;
  }

  if (options.q) {
    filter.userEmail = {
      $regex: options.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const [items, total] = await Promise.all([
    Usage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Usage.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeUsage),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
