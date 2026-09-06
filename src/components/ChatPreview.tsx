export function ChatPreview() {
  return (
    <div className="panel overflow-hidden rounded-[28px]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]" />
        <p className="text-sm text-muted">Lumina · workspace chat</p>
      </div>
      <div className="space-y-4 p-5 text-sm leading-6">
        <Bubble who="Lumina" tone="ai">
          Hi. I can help with credits, packs, or a support ticket.
        </Bubble>
        <Bubble who="You" tone="user">
          Write a 4-line product note and keep the tone confident.
        </Bubble>
        <Bubble who="Lumina" tone="ai">
          Done. Saved to your workspace. This action used 1 credit — 47 remaining.
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({
  who,
  tone,
  children,
}: {
  who: string;
  tone: "ai" | "user";
  children: React.ReactNode;
}) {
  return (
    <div className={tone === "user" ? "ml-8" : "mr-8"}>
      <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted">{who}</p>
      <div
        className={
          tone === "user"
            ? "rounded-2xl rounded-tr-md bg-white/8 px-4 py-3"
            : "rounded-2xl rounded-tl-md bg-[linear-gradient(135deg,rgba(78,161,255,0.16),rgba(139,124,255,0.12),rgba(244,114,182,0.1))] px-4 py-3"
        }
      >
        {children}
      </div>
    </div>
  );
}
