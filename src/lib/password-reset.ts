import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { Admin } from "@/models/Admin";
import { PasswordResetToken } from "@/models/PasswordResetToken";

const RESET_TTL_MS = 45 * 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  await connectDB();
  const admin = await Admin.findOne({ email }).select("_id email name");
  if (!admin) return;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await PasswordResetToken.deleteMany({ adminId: admin._id });
  await PasswordResetToken.create({ adminId: admin._id, tokenHash, expiresAt });

  try {
    await sendPasswordResetEmail({ to: admin.email, name: admin.name, token });
  } catch {
    await PasswordResetToken.deleteOne({ tokenHash });
    console.error("password reset email failed");
  }
}

export async function resetPasswordWithToken(token: string, password: string) {
  await connectDB();
  const tokenHash = hashResetToken(token);
  const reset = await PasswordResetToken.findOne({ tokenHash });
  if (!reset || reset.expiresAt.getTime() <= Date.now()) {
    if (reset) await PasswordResetToken.deleteOne({ _id: reset._id });
    return { ok: false as const };
  }

  const passwordHash = await hash(password, 12);
  const admin = await Admin.findByIdAndUpdate(reset.adminId, { passwordHash });
  await PasswordResetToken.deleteMany({ adminId: reset.adminId });
  if (!admin) return { ok: false as const };

  return { ok: true as const, adminId: admin._id.toString() };
}
