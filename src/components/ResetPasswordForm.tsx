"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState(token ? "" : "This reset link is invalid or has expired.");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    if (!data.ok) {
      setError(data.message ?? "This reset link is invalid or has expired.");
      setPending(false);
      return;
    }

    setMessage(data.message ?? "Password updated. You can sign in with the new password.");
    setPending(false);
  }

  if (!token || (error && !pending && error === "This reset link is invalid or has expired." && !message)) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-danger/10 px-3 py-3 text-sm leading-6 text-danger">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          Request a new link
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-white/6 px-3 py-3 text-sm leading-6 text-text">{message}</p>
        <Link href="/login" className="btn btn-primary w-full">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordField
        label="New password"
        name="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        minLength={8}
      />
      <PasswordField
        label="Confirm password"
        name="confirm"
        placeholder="Repeat the new password"
        autoComplete="new-password"
        minLength={8}
      />
      {error ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Please wait…" : "Update password"}
      </button>
    </form>
  );
}
