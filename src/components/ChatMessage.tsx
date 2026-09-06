"use client";

import Link from "next/link";

function formatLine(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|(?:GI|LU)-[A-Z0-9-]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("GI-") || part.startsWith("LU-")) {
      return (
        <span key={index} className="font-mono text-brass">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function TicketCard({ code }: { code: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-brass/25 bg-brass/8 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Support ticket</p>
      <p className="serif mt-1 text-2xl gradient-text">{code}</p>
      <p className="mt-1 text-sm text-muted">Saved to your workspace. Open Support anytime to track it.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/support" className="btn btn-primary px-4 py-2 text-sm">
          View ticket
        </Link>
        <button
          type="button"
          className="btn btn-ghost px-4 py-2 text-sm"
          onClick={() => void navigator.clipboard.writeText(code)}
        >
          Copy code
        </button>
      </div>
    </div>
  );
}

export function ChatMessageBody({ content, ticketCode }: { content: string; ticketCode?: string }) {
  const lines = content.replace(/\r/g, "").split("\n").filter((line) => line.trim().length > 0);
  const code = ticketCode ?? content.match(/(?:GI|LU)-[A-Z0-9-]+/)?.[0];

  return (
    <div className="space-y-2.5 text-[15px] leading-7 text-text/92">
      {lines.map((line, index) => {
        const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);
        const bullet = line.match(/^\s*[-•]\s+(.*)$/);

        if (numbered) {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4ea1ff,#8b7cff)] text-[11px] font-semibold text-white">
                {numbered[1]}
              </span>
              <p>{formatLine(numbered[2])}</p>
            </div>
          );
        }

        if (bullet) {
          return (
            <p key={index} className="pl-9 text-muted">
              {formatLine(bullet[1])}
            </p>
          );
        }

        return <p key={index}>{formatLine(line)}</p>;
      })}
      {code ? <TicketCard code={code} /> : null}
    </div>
  );
}
