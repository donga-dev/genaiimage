import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { AuthLanding } from "@/components/AuthLanding";
import { BRAND } from "@/lib/brand";

export default function ForgotPasswordPage() {
  return (
    <AuthLanding
      nav="login"
      title="Forgot password"
      subtitle={`Enter the work email for your ${BRAND.name} workspace. If it matches an account, we will send a reset link.`}
    >
      <ForgotPasswordForm />
    </AuthLanding>
  );
}
