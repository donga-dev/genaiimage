"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

type ApiKey = {
  id: string;
  name: string;
  masked: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeysPanel({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [freshToken, setFreshToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setPending(true);
    setError("");
    const response = await fetch("/api/keys", { method: "POST" });
    const data = (await response.json()) as { ok: boolean; token?: string; key?: ApiKey; message?: string };
    setPending(false);
    if (!data.ok || !data.token || !data.key) {
      setError(data.message ?? "Could not generate a key");
      return;
    }
    setFreshToken(data.token);
    setCopied(false);
    setKeys((current) => [data.key!, ...current]);
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this key? Your product will stop working until you paste a new one.")) {
      return;
    }
    const response = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { ok: boolean; message?: string };
    if (!data.ok) {
      setError(data.message ?? "Could not revoke this key");
      return;
    }
    setKeys((current) => current.filter((key) => key.id !== id));
  }

  async function copyToken() {
    await navigator.clipboard.writeText(freshToken);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {keys.length} active {keys.length === 1 ? "key" : "keys"}
        </p>
        <button
          type="button"
          className="btn btn-primary w-full px-4 py-2.5 text-sm sm:w-auto"
          onClick={() => void generate()}
          disabled={pending}
        >
          {pending ? "Generating…" : "Generate key"}
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {freshToken ? (
        <div className="rounded-2xl border border-brass/25 bg-brass/8 p-4 md:rounded-[24px] md:p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Copy this key now</p>
          <p className="mt-2 text-sm text-muted">
            We will not show the full key again. Paste it in your product, then you can close this.
          </p>
          <button
            type="button"
            onClick={() => void copyToken()}
            className="mt-4 flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left"
          >
            <span className="min-w-0 break-all font-mono text-xs text-brass sm:text-sm">{freshToken}</span>
            <span className="shrink-0 text-xs text-muted">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button type="button" className="btn btn-ghost mt-4 px-3 py-1.5 text-xs" onClick={() => setFreshToken("")}>
            I saved it
          </button>
        </div>
      ) : null}

      {keys.length === 0 ? (
        <p className="text-sm text-muted">No keys yet. Generate one and paste it in your product.</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {keys.map((key) => (
              <article key={key.id} className="rounded-2xl border border-line bg-white/4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{key.name}</p>
                    <p className="mt-1 break-all font-mono text-xs text-brass">{key.masked}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost shrink-0 px-3 py-1.5 text-xs"
                    onClick={() => void revoke(key.id)}
                  >
                    Revoke
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted">Created {formatDate(key.createdAt, true)}</p>
                <p className="mt-1 text-xs text-muted">
                  Last used {key.lastUsedAt ? formatDate(key.lastUsedAt, true) : "Never"}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Key</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Last used</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-t border-line">
                    <td className="py-3">{key.name}</td>
                    <td className="py-3 font-mono text-xs text-brass">{key.masked}</td>
                    <td className="py-3 text-muted">{formatDate(key.createdAt, true)}</td>
                    <td className="py-3 text-muted">{key.lastUsedAt ? formatDate(key.lastUsedAt, true) : "Never"}</td>
                    <td className="py-3 text-right">
                      <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => void revoke(key.id)}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
