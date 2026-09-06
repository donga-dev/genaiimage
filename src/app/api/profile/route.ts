import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializeAdmin } from "@/lib/serialize";
import { profileSchema } from "@/lib/validators";
import { Admin } from "@/models/Admin";

export async function PATCH(request: Request) {
  try {
    const { admin: current, error } = await requireApiAdmin();
    if (error || !current) return error;
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await connectDB();
    const admin = await Admin.findByIdAndUpdate(current.id, parsed.data, { returnDocument: "after" })
      .populate("currentPlanId")
      .lean();

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Admin not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, admin: serializeAdmin(admin) });
  } catch (error) {
    console.error("profile update failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not update profile" },
      { status: 500 },
    );
  }
}
