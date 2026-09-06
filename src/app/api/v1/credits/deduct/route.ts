import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireInternalToken } from "@/lib/internal-auth";
import { deductSchema } from "@/lib/validators";
import { Admin } from "@/models/Admin";
import { Usage } from "@/models/Usage";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = deductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { adminId, adminEmail, userEmail, source } = parsed.data;
    if (!Types.ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
        { status: 404 },
      );
    }

    await connectDB();

    const admin = await Admin.findOneAndUpdate(
      { _id: adminId, email: adminEmail, credits: { $gte: 1 } },
      { $inc: { credits: -1 } },
      { returnDocument: "after" },
    );

    if (!admin) {
      const exists = await Admin.findOne({ _id: adminId, email: adminEmail }).lean();
      if (!exists) {
        return NextResponse.json(
          { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_CREDITS",
          message: "No credits remaining. Purchase a credit pack to continue.",
          credits: 0,
          hasCredits: false,
        },
        { status: 402 },
      );
    }

    const usage = await Usage.create({
      adminId: admin._id,
      adminEmail: admin.email,
      userEmail,
      creditsUsed: 1,
      remainingCredits: admin.credits,
      source: source ?? null,
    });

    return NextResponse.json({
      ok: true,
      creditsUsed: 1,
      remainingCredits: admin.credits,
      hasCredits: admin.credits > 0,
      usageId: usage._id.toString(),
      userEmail,
    });
  } catch (error) {
    console.error("credit deduct failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not deduct credit" },
      { status: 500 },
    );
  }
}
