import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ApiToken } from "@/models/ApiToken";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND", message: "Key not found" }, { status: 404 });
  }

  await connectDB();
  const key = await ApiToken.findOneAndUpdate(
    { _id: id, adminId: admin.id, revokedAt: null },
    { revokedAt: new Date() },
    { returnDocument: "after" },
  );

  if (!key) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND", message: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
