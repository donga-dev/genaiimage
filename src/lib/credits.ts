import { Types } from "mongoose";
import { Admin } from "@/models/Admin";
import { Usage } from "@/models/Usage";

export async function reserveCredit(adminId: string, adminEmail: string) {
  if (!Types.ObjectId.isValid(adminId)) return { ok: false as const, reason: "not_found" as const };

  const admin = await Admin.findOneAndUpdate(
    { _id: adminId, email: adminEmail, credits: { $gte: 1 } },
    { $inc: { credits: -1 } },
    { returnDocument: "after" },
  );

  if (!admin) {
    const exists = await Admin.findOne({ _id: adminId, email: adminEmail }).lean();
    return exists
      ? { ok: false as const, reason: "no_credits" as const }
      : { ok: false as const, reason: "not_found" as const };
  }

  return { ok: true as const, credits: admin.credits };
}

export async function refundReservation(adminId: string) {
  if (!Types.ObjectId.isValid(adminId)) return;
  await Admin.findByIdAndUpdate(adminId, { $inc: { credits: 1 } });
}

export async function logCreditUse(input: {
  adminId: string;
  adminEmail: string;
  userEmail: string;
  remainingCredits: number;
  source: string;
}) {
  const usage = await Usage.create({
    adminId: input.adminId,
    adminEmail: input.adminEmail,
    userEmail: input.userEmail,
    creditsUsed: 1,
    remainingCredits: input.remainingCredits,
    source: input.source,
  });
  return usage._id.toString();
}
