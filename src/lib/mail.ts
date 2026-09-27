import nodemailer from "nodemailer";
import { BRAND } from "@/lib/brand";

const RESET_MINUTES = 45;

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const user = process.env.SMTP_USER?.trim() ?? "";
  const pass = process.env.SMTP_PASSWORD ?? "";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE !== "false";

  if (!host || !user || !pass || !Number.isFinite(port)) {
    return null;
  }

  return { host, user, pass, port, secure };
}

export function isSmtpConfigured() {
  return smtpConfig() !== null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendPasswordResetEmail(input: { to: string; name: string; token: string }) {
  const smtp = smtpConfig();
  if (!smtp) {
    throw new Error("SMTP is not configured");
  }

  const resetUrl = `${BRAND.url}/reset-password?token=${encodeURIComponent(input.token)}`;
  const safeName = escapeHtml(input.name.trim() || "there");
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transport.sendMail({
    from: `GenAI Img <${smtp.user}>`,
    to: input.to,
    subject: "Reset your GenAIImg password",
    text: [
      `Hi ${input.name.trim() || "there"},`,
      "",
      `We received a request to reset the password for your ${BRAND.name} workspace.`,
      `Open this link to choose a new password. It expires in ${RESET_MINUTES} minutes and can be used once:`,
      resetUrl,
      "",
      "If you did not request this, you can ignore this email. Your password will stay the same.",
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#0b0c10;color:#f4f4f5;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0c10;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#14161e;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
            <tr>
              <td style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#d6b37a;">${escapeHtml(BRAND.name)}</td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:28px;line-height:1.3;">Reset your password</td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#c4c4cc;">
                Hi ${safeName}, we received a request to reset the password for your workspace. This link expires in ${RESET_MINUTES} minutes and works only once.
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;">
                <a href="${resetUrl}" style="display:inline-block;background:#f4f4f5;color:#111216;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;padding:12px 20px;">Reset password</a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#9a9aa3;">
                If you did not request this reset, you can ignore this email. Your password will stay the same.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
}
