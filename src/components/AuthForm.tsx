"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          }
        : {
            name: String(form.get("name") ?? ""),
            companyName: String(form.get("companyName") ?? ""),
            email: String(form.get("email") ?? ""),
            phone: String(form.get("phone") ?? ""),
            password: String(form.get("password") ?? ""),
          };

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    if (!data.ok) {
      setError(data.message ?? "Something went wrong");
      setPending(false);
      return;
    }

    router.push(next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" ? (
        <>
          <Field label="Full name" name="name" placeholder="Aarav Shah" />
          <Field label="Company" name="companyName" placeholder="Northwind Labs" />
          <Field label="Mobile" name="phone" placeholder="9876543210" />
        </>
      ) : null}
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      {error ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Please wait…" : mode === "login" ? "Continue to workspace" : "Create workspace"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New to {BRAND.name}?{" "}
            <Link href="/signup" className="text-brass hover:underline">
              Create a workspace
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="text-brass hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        className="input"
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
