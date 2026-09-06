import { Model, Schema, Types, models, model } from "mongoose";

export type TicketDoc = {
  adminId: Types.ObjectId;
  code: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
};

const TicketSchema = new Schema<TicketDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    code: { type: String, required: true, unique: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true },
);

TicketSchema.index({ adminId: 1, createdAt: -1 });

export const Ticket: Model<TicketDoc> = models.Ticket || model<TicketDoc>("Ticket", TicketSchema);
