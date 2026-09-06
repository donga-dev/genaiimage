import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthLanding } from "@/components/AuthLanding";
import { BRAND } from "@/lib/brand";

export default function SignupPage() {
  return (
    <AuthLanding
      title="Create a workspace"
      subtitle={`Join ${BRAND.name}. Buy credits here for image generate.`}
    >
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthLanding>
  );
}
