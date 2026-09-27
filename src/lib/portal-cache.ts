import { serializeApiToken } from "@/lib/api-tokens";
import { getDashboardData } from "@/lib/dashboard";
import { connectDB } from "@/lib/db";
import { serializePlan, serializePurchase } from "@/lib/serialize";
import { ApiToken } from "@/models/ApiToken";
import { Plan } from "@/models/Plan";
import { Purchase } from "@/models/Purchase";
import { Ticket } from "@/models/Ticket";

type Slot<T> = { at: number; value: T };

const slots = new Map<string, Slot<unknown>>();

function readCached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = slots.get(key) as Slot<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.value);
  return load().then((value) => {
    slots.set(key, { at: Date.now(), value });
    return value;
  });
}

export function forgetAdminPortalCache(adminId: string) {
  slots.delete(`${adminId}:dash`);
  slots.delete(`${adminId}:purchases`);
  slots.delete(`${adminId}:keys`);
  slots.delete(`${adminId}:tickets`);
}

export function listActivePlans() {
  return readCached("plans:active", 5 * 60_000, async () => {
    await connectDB();
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    return plans.map(serializePlan);
  });
}

export function cachedDashboard(adminId: string) {
  return readCached(`${adminId}:dash`, 15_000, () => getDashboardData(adminId));
}

export function listPurchases(adminId: string) {
  return readCached(`${adminId}:purchases`, 20_000, async () => {
    await connectDB();
    const purchases = await Purchase.find({ adminId }).sort({ purchasedAt: -1 }).lean();
    return purchases.map(serializePurchase);
  });
}

export function listWorkspaceKeys(adminId: string) {
  return readCached(`${adminId}:keys`, 20_000, async () => {
    await connectDB();
    const keys = await ApiToken.find({ adminId, revokedAt: null }).sort({ createdAt: -1 }).lean();
    return keys.map((key) => serializeApiToken(key));
  });
}

export function listTickets(adminId: string) {
  return readCached(`${adminId}:tickets`, 20_000, async () => {
    await connectDB();
    return Ticket.find({ adminId }).sort({ createdAt: -1 }).lean();
  });
}
