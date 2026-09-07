"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatMessageBody } from "@/components/ChatMessage";
import { BRAND } from "@/lib/brand";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ticketCode?: string;
  at: number;
};

type Chip = { label: string; send?: string; href?: string };

const STORAGE_KEY = "genaiimg-support-chat";

const SUGGESTIONS = [
  "How do I buy credits?",
  "Which pack is best for my team?",
  "Where do I see activity?",
  "Create a support ticket for a credit purchase issue",
];

function newId() {
  return crypto.randomUUID();
}

function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${hello}, ${name}` : hello;
}

function clock(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function hydrate(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<ChatMessage>;
    if ((row.role !== "user" && row.role !== "assistant") || typeof row.content !== "string") return [];
    return [
      {
        id: typeof row.id === "string" ? row.id : newId(),
        role: row.role,
        content: row.content,
        ticketCode: typeof row.ticketCode === "string" ? row.ticketCode : undefined,
        at: typeof row.at === "number" ? row.at : Date.now(),
      },
    ];
  });
}

function chipsFor(messages: ChatMessage[]): Chip[] {
  const last = [...messages].reverse().find((item) => item.role === "assistant");
  if (!last) return [];
  if (last.ticketCode) {
    return [
      { label: "View ticket", href: "/support" },
      { label: "Buy credits", href: "/plans" },
    ];
  }
  if (/pack|Starter|Growth|Bulk|Buy credits|Razorpay/i.test(last.content)) {
    return [
      { label: "Go to Buy credits", href: "/plans" },
      { label: "How do credits work?", send: "How do credits work?" },
      { label: "Open a ticket", send: "Create a support ticket for help choosing a pack" },
    ];
  }
  if (/Activity/i.test(last.content)) {
    return [
      { label: "Open Activity", href: "/usage" },
      { label: "How do I buy credits?", send: "How do I buy credits?" },
    ];
  }
  if (/Billing/i.test(last.content)) {
    return [
      { label: "Open Billing", href: "/purchases" },
      { label: "Open a ticket", send: "Create a support ticket about a purchase" },
    ];
  }
  if (/Workspace/i.test(last.content)) {
    return [{ label: "Open Workspace", href: "/profile" }];
  }
  return [
    { label: "Buy credits", href: "/plans" },
    { label: "Activity", href: "/usage" },
    { label: "Open a ticket", send: "Create a support ticket" },
  ];
}

export function ChatWindow({ firstName = "", credits = 0 }: { firstName?: string; credits?: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [retryText, setRetryText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setMessages(hydrate(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]")));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, ready]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function resizeInput() {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  }

  async function sendText(text: string) {
    const value = text.trim();
    if (!value || pending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: newId(), role: "user", content: value, at: Date.now() },
    ];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    setError("");
    setRetryText("");
    if (inputRef.current) inputRef.current.style.height = "44px";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-20).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string; ticketCode?: string };

      if (!data.ok || !data.message) {
        setError(data.message ?? "Could not get a reply");
        setRetryText(value);
        setPending(false);
        return;
      }

      setMessages([
        ...nextMessages,
        {
          id: newId(),
          role: "assistant",
          content: data.message,
          ticketCode: data.ticketCode,
          at: Date.now(),
        },
      ]);
    } catch {
      setError("Connection dropped. Try that again.");
      setRetryText(value);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  async function copyMessage(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="gradient-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] md:rounded-[32px]">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 md:px-7 md:py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[conic-gradient(from_210deg,#4ea1ff,#8b7cff,#f472b6,#fb923c,#4ea1ff)] shadow-[0_0_24px_rgba(139,124,255,0.35)]">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <div>
            <p className="text-sm font-semibold">{BRAND.name} Support</p>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              <span>Online · free chat</span>
              <span className="hidden sm:inline">· {credits} credits on hand</span>
            </p>
          </div>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            className="btn btn-ghost px-3 py-1.5 text-xs"
            onClick={() => {
              setMessages([]);
              setError("");
              setRetryText("");
              sessionStorage.removeItem(STORAGE_KEY);
            }}
          >
            New chat
          </button>
        ) : null}
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-10">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-brass">{greeting(firstName)}</p>
            <p className="serif mt-3 text-3xl md:text-6xl gradient-text">How can I help?</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Credits, packs, activity, billing, or a support ticket — ask in your own words. This chat
              never spends a credit.
            </p>
            <div className="mt-8 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendText(item)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-6 text-text transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="chat-in flex justify-end">
                <div className="max-w-[min(42rem,85%)]">
                  <div className="rounded-[22px] rounded-br-md bg-white/10 px-5 py-3.5 text-[15px] leading-6">
                    {message.content}
                  </div>
                  <p className="mt-1.5 text-right text-[11px] text-muted">{clock(message.at)}</p>
                </div>
              </div>
            ) : (
              <div key={message.id} className="chat-in flex gap-3">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4ea1ff,#8b7cff)] text-[11px] font-semibold text-white">
                  G
                </span>
                <div className="group max-w-[min(46rem,90%)]">
                  <div className="rounded-[22px] rounded-tl-md border border-white/8 bg-white/4 px-5 py-4">
                    <ChatMessageBody content={message.content} ticketCode={message.ticketCode} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                    <span>{clock(message.at)}</span>
                    <button type="button" onClick={() => copyMessage(message.id, message.content)} className="hover:text-text">
                      {copied === message.id ? "Copied" : "Copy reply"}
                    </button>
                  </div>
                </div>
              </div>
            ),
          )
        )}
        {pending ? (
          <div className="chat-in flex items-center gap-3 text-sm text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4ea1ff,#8b7cff)] text-[11px] font-semibold text-white">
              G
            </span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass-strong [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass" />
            </span>
          </div>
        ) : null}
        {!pending && messages.some((item) => item.role === "assistant") ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {chipsFor(messages).map((chip) =>
              chip.href ? (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted hover:text-text"
                >
                  {chip.label}
                </Link>
              ) : (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => sendText(chip.send ?? chip.label)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted hover:text-text"
                >
                  {chip.label}
                </button>
              ),
            )}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendText(input);
        }}
        className="border-t border-white/8 px-3 py-3 md:px-8 md:py-5"
      >
        {error ? (
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-danger">
            <p>{error}</p>
            {retryText ? (
              <button type="button" className="btn btn-ghost px-3 py-1 text-xs text-text" onClick={() => sendText(retryText)}>
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={`chat-composer flex items-end gap-3 rounded-[26px] px-3 py-2 ${focused ? "is-focused" : ""}`}>
          <textarea
            ref={inputRef}
            rows={1}
            className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] outline-none placeholder:text-muted"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              resizeInput();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendText(input);
              }
            }}
            placeholder="Ask anything about your workspace…"
            maxLength={4000}
            disabled={pending}
          />
          <button type="submit" disabled={pending || !input.trim()} className="btn btn-primary h-11 min-w-11 px-3 sm:px-4" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.4 8.4 13.2 2.8 8.1 13.7l-.9-4.4-4.8-.9Z" fill="currentColor" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          Enter to send · Shift+Enter for a new line · {4000 - input.length} left
        </p>
      </form>
    </div>
  );
}
