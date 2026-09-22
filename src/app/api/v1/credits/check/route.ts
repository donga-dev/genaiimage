import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { splitCredits } from "@/lib/image-models";
import { requireInternalToken } from "@/lib/internal-auth";
import { creditLookupSchema } from "@/lib/validators";
import { Admin } from "@/models/Admin";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = creditLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { adminId, adminEmail } = parsed.data;
    if (!Types.ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
        { status: 404 },
      );
    }

    await connectDB();
    const admin = await Admin.findOne({ _id: adminId, email: adminEmail }).lean();
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
        { status: 404 },
      );
    }

    const split = splitCredits(admin);

    return NextResponse.json({
      ok: true,
      hasCredits: split.credits > 0,
      credits: {
        "genaiimg-v1": split.creditsV1,
        "genaiimg-v2": split.creditsV2,
        "genaiimg-v3": split.creditsV3,
      },
      adminId: admin._id.toString(),
      adminEmail: admin.email,
    });
  } catch (error) {
    console.error("credit check failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not check credits" },
      { status: 500 },
    );
  }
}
