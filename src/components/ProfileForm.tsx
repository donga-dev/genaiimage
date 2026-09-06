"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicAdmin } from "@/types";

export function ProfileForm({ admin }: { admin: PublicAdmin }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        companyName: String(form.get("companyName") ?? ""),
        phone: String(form.get("phone") ?? ""),
      }),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    if (!data.ok) {
      setError(data.message ?? "Could not save");
      setPending(false);
      return;
    }

    setMessage("Account updated");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Full name</span>
        <input className="input" name="name" defaultValue={admin.name} required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Company</span>
        <input className="input" name="companyName" defaultValue={admin.companyName} required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Email</span>
        <input className="input opacity-70" value={admin.email} disabled />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Mobile</span>
        <input className="input" name="phone" defaultValue={admin.phone} required />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-ok">{message}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
