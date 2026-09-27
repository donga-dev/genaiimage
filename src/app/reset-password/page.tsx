import { AuthLanding } from "@/components/AuthLanding";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <AuthLanding nav="login" title="Choose a new password" subtitle="This link works once and expires after 45 minutes.">
      <ResetPasswordForm token={token} />
    </AuthLanding>
  );
}
