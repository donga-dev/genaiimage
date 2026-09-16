import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { getSessionCookieOptions, SESSION_COOKIE, signSession } from "@/lib/session";
import { Admin } from "@/models/Admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { name, companyName, email, phone, password } = parsed.data;
    await connectDB();

    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "EMAIL_TAKEN", message: "An admin with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const admin = await Admin.create({
      name,
      companyName,
      email,
      phone,
      passwordHash,
      credits: 0,
      creditsV1: 0,
      creditsV2: 0,
    });

    const token = await signSession({ adminId: admin._id.toString(), email });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("signup failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not create account" },
      { status: 500 },
    );
  }
}
