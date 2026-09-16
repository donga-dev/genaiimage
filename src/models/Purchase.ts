import { Model, Schema, Types, models, model } from "mongoose";

export type PurchaseStatus = "pending" | "completed" | "failed";

export type PurchaseDoc = {
  adminId: Types.ObjectId;
  planId: Types.ObjectId;
  planName: string;
  model: string;
  credits: number;
  pricePerCredit: number;
  amountPaid: number;
  status: PurchaseStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const PurchaseSchema = new Schema<PurchaseDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    planName: { type: String, required: true },
    model: { type: String, default: "genaiimg-v1", trim: true },
    credits: { type: Number, required: true },
    pricePerCredit: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

PurchaseSchema.index({ adminId: 1, purchasedAt: -1 });
PurchaseSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

export const Purchase: Model<PurchaseDoc> =
  models.Purchase || model<PurchaseDoc>("Purchase", PurchaseSchema);
