import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { serializeAdmin } from "@/lib/serialize";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { Admin } from "@/models/Admin";
import { Plan } from "@/models/Plan";
import type { PublicAdmin } from "@/types";

void Plan;

export async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentAdmin(): Promise<PublicAdmin | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  await connectDB();
  const admin = await Admin.findById(session.adminId).populate("currentPlanId").lean();
  if (!admin || admin.email !== session.email) return null;

  return serializeAdmin(admin);
}

export async function requireAdmin(): Promise<PublicAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}

export async function requireApiAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED", message: "Login required" },
        { status: 401 },
      ),
    };
  }
  return { admin, error: null };
}
