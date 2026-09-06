import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { getSessionCookieOptions, SESSION_COOKIE, signSession } from "@/lib/session";
import { Admin } from "@/models/Admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    await connectDB();

    const admin = await Admin.findOne({ email }).select("+passwordHash");
    if (!admin?.passwordHash) {
      return NextResponse.json(
        { ok: false, error: "INVALID_CREDENTIALS", message: "Email or password is incorrect" },
        { status: 401 },
      );
    }

    const valid = await compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "INVALID_CREDENTIALS", message: "Email or password is incorrect" },
        { status: 401 },
      );
    }

    const token = await signSession({ adminId: admin._id.toString(), email: admin.email });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("login failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Could not log in" },
      { status: 500 },
    );
  }
}
