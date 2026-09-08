"use client";

import { useState } from "react";

export function CopyCode({ code, label = "Example" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-3 py-2">
        <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-text"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-6 text-brass sm:text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
