import { BRAND } from "@/lib/brand";

export const CHAT_REFUSAL =
  "I can help with buying credits, checking activity, billing, or your workspace. I cannot explain how the platform is built. What do you need help with?";

export const CONFIDENTIAL_ITEMS = [
  "JWT_SECRET and login session cookies",
  "INTERNAL_API_TOKEN used by the other product to check/deduct credits",
  "Full workspace API keys after the create screen",
  "GROQ_API_KEY",
  "RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET",
  "MONGODB_URI and database credentials",
  "Admin password hashes and other users' accounts",
  "Razorpay payment signatures and raw webhook payloads",
  ".env.local / .env values",
  "Source-code internals, file paths, APIs, and how to bypass credit checks",
] as const;

const SECRET_ASK =
  /\b(api[_-]?key|secret|token|password|hash|jwt|mongodb(\s*uri)?|connection string|env(\.local)?|webhook|internal[_-]?token|bypass|exploit)\b/i;

const LOGIC_ASK =
  /\b(logic|architect|source|codebase|repo|github|file path|folder|schema|database|mongoose|mongodb|endpoint|payload|deduct|webhook|razorpay (order|signature|verify)|how (is|are) (credits )?(deducted|stored|checked)|implement|next\.js|api\/v1|adminId|internal api)\b/i;

function isApiKeysHelp(text: string) {
  return (
    /\b(api keys?|api token|generate (a )?(key|token)|where.{0,16}(api key|token))\b/i.test(text) &&
    !/\b(jwt|internal[_-]?token|secret|env|hash|bypass)\b/i.test(text)
  );
}

function isPublicDocsHelp(text: string) {
  if (/\b(jwt|internal[_-]?token|secret|env|hash|bypass|adminId)\b/i.test(text)) return false;
  return /\b(api docs?|api documentation|docs page|generate image api|check credits|image api|\/api\/v1\/(image|credits))\b/i.test(
    text,
  );
}

export function isRestrictedQuestion(text: string) {
  if (isApiKeysHelp(text) || isPublicDocsHelp(text)) return false;
  return SECRET_ASK.test(text) || LOGIC_ASK.test(text);
}

function firstName(name?: string) {
  const value = name?.trim().split(/\s+/)[0];
  return value || "";
}

export function cannedReply(text: string, name?: string) {
  const t = text.trim();
  const who = firstName(name);
  if (/^(hi|hii+|hello|hey+|yo|sup|hola|namaste|kem cho|good (morning|afternoon|evening))[\s!.]*$/i.test(t)) {
    return who
      ? `Hi ${who}. Credits, packs, activity, billing, or a ticket — I am here. What do you need?`
      : "Hi. Credits, packs, activity, billing, or a ticket — I am here. What do you need?";
  }
  if (/^(thanks|thank you|thx|ok|okay|cool|nice)[\s!.]*$/i.test(t)) {
    return "Anytime. Ask if you need help with credits, activity, or billing.";
  }
  return null;
}

export function cannedHowTo(text: string) {
  const t = text.trim();

  if (/\b(which pack|best pack|best plan|show (me )?(the )?packs|compare packs|cheapest pack)\b/i.test(t)) {
    return [
      "Two models on Buy credits: genaiimg-v1 and genaiimg-v2. v2 packs cost more.",
      "1. genaiimg-v1: Starter 100 at ₹15, Growth 500 at ₹10, Bulk 5000 at ₹8.",
      "2. genaiimg-v2: Starter 100 at ₹25, Growth 500 at ₹18, Bulk 5000 at ₹14.",
      "3. Pick the model first, then the pack.",
    ].join("\n");
  }

  if (/\b((buy|purchase|get|top ?up).{0,24}credits?|how.{0,20}(buy|purchase)|open buy credits)\b/i.test(t)) {
    return [
      "You buy a one-time pack. Credits land after Razorpay payment.",
      "1. Open Buy credits in the left sidebar.",
      "2. Pick genaiimg-v1 or genaiimg-v2, then Starter, Growth, or Bulk.",
      "3. Pay with Razorpay. Unused credits stay.",
    ].join("\n");
  }

  if (/\b(where.{0,16}activity|see activity|usage|who used)\b/i.test(t)) {
    return [
      "Activity is the log of every credit your product used.",
      "1. Open Activity in the sidebar.",
      "2. You will see the user email, time, and remaining credits.",
    ].join("\n");
  }

  if (/\b(where.{0,16}billing|past purchases?|payment history|invoices?)\b/i.test(t)) {
    return [
      "Billing is your purchase history.",
      "1. Open Billing in the sidebar.",
      "2. Each paid pack is listed with the date and amount.",
    ].join("\n");
  }

  if (/\b(workspace|edit (my )?(name|company|phone)|account details)\b/i.test(t)) {
    return [
      "Workspace holds your account details.",
      "1. Open Workspace in the sidebar.",
      "2. Update name, company, or phone, then save.",
    ].join("\n");
  }

  if (isApiKeysHelp(t)) {
    return [
      "API keys live in the API keys tab. Copy the full key only once.",
      "1. Open API keys in the sidebar.",
      "2. Generate a key and copy it.",
      "3. Paste it in your product. Open API docs for the two endpoints.",
    ].join("\n");
  }

  if (isPublicDocsHelp(t)) {
    return [
      "API docs lists generate image and check credits. Check credits is the workspace balance, not a person.",
      "1. Open API docs from the top bar, or from the sidebar after you sign in.",
      "2. Use your workspace API key on both calls.",
      "3. I will not paste payloads or keys here.",
    ].join("\n");
  }

  if (/\b(how credits work|what (is|are) (a )?credits?|does chat (use|cost|deduct))\b/i.test(t)) {
    return [
      "One image generate uses one credit. Unused credits stay.",
      "1. This Chat is free and never deducts credits.",
      "2. Buy a pack when you want more. There is no monthly expiry.",
    ].join("\n");
  }

  return null;
}

export function buildChatSystemPrompt() {
  return [
    `You are ${BRAND.name} Support. Speak like a calm, friendly admin helper.`,
    "Help only with using the workspace: buy credits, activity, billing, API keys, and account details.",
    "Do not explain how the product is built, APIs, code, database, or payment internals.",
    "If asked those things, refuse in one short line and offer normal help.",
    "Never invent pages. Only these exist: Overview, Chat, Buy credits, Activity, Billing, Support, API docs, API keys, Workspace.",
    "If the user asks you to create or generate a support ticket, do not give fake steps. The system creates the ticket and you only confirm the ticket code.",
    "",
    "Match the user's message:",
    "- Greeting like hi/hello: reply in 1 or 2 short sentences only. Do not give steps.",
    "- How-to question: one short answer, then 2 to 4 one-line steps.",
    "- Never dump a full guide unless they asked how to do that thing.",
    "Do not write long paragraphs. Do not use markdown headings. Do not say Avatar, Marketplace, Project Settings, Agents, or Search. The product only does image generate. This Chat tab is support only.",
    "",
    "Facts:",
    "- Buy credits: left sidebar → Buy credits → pick genaiimg-v1 or genaiimg-v2 → pick Starter, Growth, or Bulk → pay with Razorpay.",
    "- genaiimg-v1: Starter 100 credits ₹15 each. Growth 500 credits ₹10 each. Bulk 5000 credits ₹8 each.",
    "- genaiimg-v2: Starter 100 credits ₹25 each. Growth 500 credits ₹18 each. Bulk 5000 credits ₹14 each. Dummy prices, higher than v1.",
    "- Activity: see who used a credit and when.",
    "- Billing: past purchases.",
    "- Workspace: edit name, company, and phone.",
    "- API keys: generate a key, copy it once, paste it in your product.",
    "- API docs: public page for generate image and check workspace credits. Point people there. Do not paste curl, keys, or payloads.",
    "- Credits are only for image generate. 1 image generate uses 1 credit. Unused credits stay. This support Chat does not use credits.",
    "- Support page shows tickets created from Chat.",
  ].join("\n");
}

function secretValues() {
  return [
    process.env.JWT_SECRET,
    process.env.INTERNAL_API_TOKEN,
    process.env.GROQ_API_KEY,
    process.env.RAZORPAY_KEY_ID,
    process.env.RAZORPAY_KEY_SECRET,
    process.env.RAZORPAY_WEBHOOK_SECRET,
    process.env.MONGODB_URI,
    process.env.META_API_KEY,
  ].filter((value): value is string => Boolean(value && value.length > 6));
}

export function sanitizeChatOutput(text: string) {
  let next = text;
  for (const value of secretValues()) {
    next = next.split(value).join("[redacted]");
  }
  return next
    .replace(/lum_[A-Za-z0-9_-]{12,}/g, "[redacted]")
    .replace(/gai_[A-Za-z0-9_-]{12,}/g, "[redacted]")
    .replace(/gsk_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/rzp_(live|test)_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, "[redacted]");
}
