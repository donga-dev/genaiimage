"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupportTicketForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = (await response.json()) as { ok: boolean; message?: string; ticket?: { code: string } };
    setPending(false);
    if (!data.ok || !data.ticket) {
      setError(data.message ?? "Could not create the ticket");
      return;
    }
    setCode(data.ticket.code);
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="panel space-y-4 rounded-[28px] p-6">
      <div>
        <p className="serif text-2xl">New ticket</p>
        <p className="mt-1 text-sm text-muted">Write what is stuck. You will get a ticket code.</p>
      </div>
      <textarea
        className="input min-h-28 resize-y"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Credits did not add after payment…"
        maxLength={2000}
        required
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {code ? <p className="text-sm text-ok">Ticket {code} is open.</p> : null}
      <button type="submit" className="btn btn-primary px-4 py-2 text-sm" disabled={pending || message.trim().length < 4}>
        {pending ? "Saving…" : "Create ticket"}
      </button>
    </form>
  );
}
