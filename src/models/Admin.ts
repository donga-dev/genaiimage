import { Model, Schema, Types, models, model } from "mongoose";

export type AdminDoc = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  passwordHash: string;
  credits: number;
  lastPurchaseDate: Date | null;
  currentPlanId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const AdminSchema = new Schema<AdminDoc>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    credits: { type: Number, default: 0, min: 0 },
    lastPurchaseDate: { type: Date, default: null },
    currentPlanId: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
  },
  { timestamps: true },
);

export const Admin: Model<AdminDoc> = models.Admin || model<AdminDoc>("Admin", AdminSchema);
