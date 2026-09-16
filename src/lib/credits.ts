import { Types } from "mongoose";
import { creditField, type ImageModelId } from "@/lib/image-models";
import { Admin } from "@/models/Admin";
import { Usage } from "@/models/Usage";

export async function migrateSplitCredits() {
  await Admin.collection.updateMany(
    {
      $expr: {
        $and: [
          { $eq: [{ $ifNull: ["$creditsV1", 0] }, 0] },
          { $eq: [{ $ifNull: ["$creditsV2", 0] }, 0] },
          { $gt: [{ $ifNull: ["$credits", 0] }, 0] },
        ],
      },
    },
    [{ $set: { creditsV1: "$credits", creditsV2: 0 } }],
  );
}

export async function reserveCredit(adminId: string, adminEmail: string, model: ImageModelId) {
  if (!Types.ObjectId.isValid(adminId)) return { ok: false as const, reason: "not_found" as const };

  const field = creditField(model);
  const admin = await Admin.findOneAndUpdate(
    { _id: adminId, email: adminEmail, [field]: { $gte: 1 } },
    { $inc: { [field]: -1, credits: -1 } },
    { returnDocument: "after" },
  );

  if (!admin) {
    const exists = await Admin.findOne({ _id: adminId, email: adminEmail }).lean();
    return exists
      ? { ok: false as const, reason: "no_credits" as const }
      : { ok: false as const, reason: "not_found" as const };
  }

  return { ok: true as const, credits: admin[field] };
}

export async function refundReservation(adminId: string, model: ImageModelId) {
  if (!Types.ObjectId.isValid(adminId)) return;
  const field = creditField(model);
  await Admin.findByIdAndUpdate(adminId, { $inc: { [field]: 1, credits: 1 } });
}

export async function logCreditUse(input: {
  adminId: string;
  adminEmail: string;
  userEmail: string;
  remainingCredits: number;
  source: string;
  model: ImageModelId;
}) {
  const usage = await Usage.create({
    adminId: input.adminId,
    adminEmail: input.adminEmail,
    userEmail: input.userEmail,
    creditsUsed: 1,
    remainingCredits: input.remainingCredits,
    source: input.source,
    model: input.model,
  });
  return usage._id.toString();
}
