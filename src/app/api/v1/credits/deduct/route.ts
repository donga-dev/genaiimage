import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { logCreditUse, reserveCredit } from "@/lib/credits";
import { connectDB } from "@/lib/db";
import { parseImageModel } from "@/lib/image-models";
import { requireInternalToken } from "@/lib/internal-auth";
import { deductSchema } from "@/lib/validators";

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

    const { adminId, adminEmail, userEmail, source, model: rawModel } = parsed.data;
    if (!Types.ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
        { status: 404 },
      );
    }

    await connectDB();
    const model = parseImageModel(rawModel) || parseImageModel(request.headers.get("x-model")) || "genaiimg-v1";
    const reserved = await reserveCredit(adminId, adminEmail, model);

    if (!reserved.ok) {
      if (reserved.reason === "not_found") {
        return NextResponse.json(
          { ok: false, error: "ADMIN_NOT_FOUND", message: "Admin not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_CREDITS",
          message: `No ${model} credits remaining. Purchase a ${model} pack to continue.`,
          model,
          credits: 0,
          hasCredits: false,
        },
        { status: 402 },
      );
    }

    const usageId = await logCreditUse({
      adminId,
      adminEmail,
      userEmail,
      remainingCredits: reserved.credits,
      source: source ?? "image",
      model,
    });

    return NextResponse.json({
      ok: true,
      creditsUsed: 1,
      remainingCredits: reserved.credits,
      hasCredits: reserved.credits > 0,
      model,
      usageId,
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
