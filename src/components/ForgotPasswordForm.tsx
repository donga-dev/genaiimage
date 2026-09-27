"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email") ?? "") }),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    if (!data.ok) {
      setError(data.message ?? "Something went wrong");
      setPending(false);
      return;
    }

    setMessage(data.message ?? "If an account exists for that email, we sent a password reset link.");
    setPending(false);
  }

  if (message) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-white/6 px-3 py-3 text-sm leading-6 text-text">{message}</p>
        <Link href="/login" className="btn btn-primary w-full">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Work email</span>
        <input
          className="input"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
      </label>
      {error ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Please wait…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-brass hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
