import { Model, Schema, models, model } from "mongoose";
import type { ImageModelId } from "@/lib/image-models";

export type PlanDoc = {
  slug: string;
  name: string;
  model: ImageModelId;
  description: string;
  credits: number;
  pricePerCredit: number;
  totalPrice: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const PlanSchema = new Schema<PlanDoc>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, enum: ["genaiimg-v1", "genaiimg-v2"], default: "genaiimg-v1", index: true },
    description: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
    pricePerCredit: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Plan: Model<PlanDoc> = models.Plan || model<PlanDoc>("Plan", PlanSchema);
