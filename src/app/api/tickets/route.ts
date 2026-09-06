import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Ticket } from "@/models/Ticket";

export async function GET() {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;
  await connectDB();
  const tickets = await Ticket.find({ adminId: admin.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    ok: true,
    tickets: tickets.map((ticket) => ({
      id: ticket._id.toString(),
      code: ticket.code,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    })),
  });
}
