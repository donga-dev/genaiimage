"use client";

import { useState } from "react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-black/20 px-3 py-2 text-left"
      >
        <span className="break-all font-mono text-sm text-brass">{value}</span>
        <span className="shrink-0 text-xs text-muted">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
