import { Model, Schema, Types, models, model } from "mongoose";

export type UsageDoc = {
  adminId: Types.ObjectId;
  adminEmail: string;
  userEmail: string;
  creditsUsed: number;
  remainingCredits: number;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const UsageSchema = new Schema<UsageDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    creditsUsed: { type: Number, required: true, min: 1 },
    remainingCredits: { type: Number, required: true, min: 0 },
    source: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

UsageSchema.index({ adminId: 1, createdAt: -1 });
UsageSchema.index({ adminId: 1, userEmail: 1, createdAt: -1 });

export const Usage: Model<UsageDoc> = models.Usage || model<UsageDoc>("Usage", UsageSchema);
