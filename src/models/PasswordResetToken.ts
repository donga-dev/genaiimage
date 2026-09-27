import { Model, Schema, Types, model, models } from "mongoose";

export type PasswordResetTokenDoc = {
  adminId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken: Model<PasswordResetTokenDoc> =
  models.PasswordResetToken || model<PasswordResetTokenDoc>("PasswordResetToken", PasswordResetTokenSchema);
