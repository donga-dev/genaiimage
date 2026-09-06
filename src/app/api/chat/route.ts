import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import {
  buildChatSystemPrompt,
  cannedHowTo,
  cannedReply,
  CHAT_REFUSAL,
  isRestrictedQuestion,
  sanitizeChatOutput,
} from "@/lib/chat-policy";
import { connectDB } from "@/lib/db";
import { createSupportTicket, isTicketRequest } from "@/lib/tickets";
import { chatSchema } from "@/lib/validators";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["llama-3.1-8b-instant", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"];

export async function POST(request: Request) {
  const { admin, error } = await requireApiAdmin();
  if (error || !admin) return error;

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "CHAT_NOT_CONFIGURED",
        message: "Add a free GROQ_API_KEY from console.groq.com to .env.local, then restart the server.",
      },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid chat" },
      { status: 400 },
    );
  }

  const latest = parsed.data.messages.at(-1)?.content ?? "";
  const ready = cannedReply(latest, admin.name);
  if (ready) {
    return NextResponse.json({ ok: true, message: ready });
  }
  if (isTicketRequest(latest)) {
    await connectDB();
    const ticket = await createSupportTicket(admin.id, latest);
    return NextResponse.json({
      ok: true,
      ticketCode: ticket.code,
      message: `All set. Support ticket ${ticket.code} is open. Track it anytime under Support.`,
    });
  }
  if (isRestrictedQuestion(latest)) {
    return NextResponse.json({ ok: true, message: CHAT_REFUSAL });
  }
  const howTo = cannedHowTo(latest);
  if (howTo) {
    return NextResponse.json({ ok: true, message: howTo });
  }

  const payload = {
    temperature: 0.2,
    max_tokens: 320,
    messages: [
      { role: "system", content: buildChatSystemPrompt() },
      ...parsed.data.messages,
    ],
  };

  let lastMessage = "Chat is unavailable right now.";

  for (const model of MODELS) {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, model }),
    });

    const data = (await response.json()) as {
      error?: { message?: string; code?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (response.ok) {
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        return NextResponse.json({ ok: true, message: sanitizeChatOutput(content) });
      }
    }

    lastMessage = data.error?.message ?? lastMessage;
    if (response.status !== 400 && response.status !== 404) {
      return NextResponse.json(
        { ok: false, error: "GROQ_ERROR", message: lastMessage },
        { status: response.status === 429 ? 429 : 502 },
      );
    }
  }

  return NextResponse.json({ ok: false, error: "GROQ_ERROR", message: lastMessage }, { status: 502 });
}
