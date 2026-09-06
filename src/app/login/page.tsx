import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthLanding } from "@/components/AuthLanding";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  return (
    <AuthLanding
      title="Welcome back"
      subtitle={`Sign in to ${BRAND.name} and buy credits for image generate.`}
    >
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthLanding>
  );
}
