import { Model, Schema, Types, model, models } from "mongoose";

export type ApiTokenDoc = {
  adminId: Types.ObjectId;
  name: string;
  tokenHash: string;
  prefix: string;
  last4: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const ApiTokenSchema = new Schema<ApiTokenDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    tokenHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    last4: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ApiTokenSchema.index({ adminId: 1, revokedAt: 1, createdAt: -1 });

export const ApiToken: Model<ApiTokenDoc> =
  models.ApiToken || model<ApiTokenDoc>("ApiToken", ApiTokenSchema);
