import { CopyCode } from "@/components/CopyCode";
import { BRAND } from "@/lib/brand";

const BASE = BRAND.url;

const generateCurl = `curl -X POST "${BASE}/api/v1/image" \\
  -H "Authorization: Bearer gai_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "x-model: genaiimg-v1" \\
  -H "x-user-email: artist@client.com" \\
  -d "{\\"image\\":\\"https://example.com/source.png\\",\\"prompt\\":\\"your prompt here\\"}"`;

const generateV2Curl = `curl -X POST "${BASE}/api/v1/image" \\
  -H "Authorization: Bearer gai_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "x-model: genaiimg-v2" \\
  -H "x-user-email: artist@client.com" \\
  -d "{\\"image\\":\\"https://example.com/source.png\\",\\"prompt\\":\\"your prompt here\\",\\"size\\":\\"944x816\\"}"`;

const generateV3Curl = `curl -X POST "${BASE}/api/v1/image" \\
  -H "Authorization: Bearer gai_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "x-model: genaiimg-v3" \\
  -H "x-user-email: artist@client.com" \\
  -d "{\\"image\\":\\"https://example.com/source.png\\",\\"prompt\\":\\"your prompt here\\",\\"aspectRatio\\":\\"5:4\\"}"`;

const creditsCurl = `curl -X GET "${BASE}/api/v1/credits" \\
  -H "Authorization: Bearer gai_YOUR_KEY"`;

export function ApiDocs() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 md:space-y-7">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brass">API reference</p>
        <h1 className="serif mt-2 text-3xl leading-tight md:text-4xl">
          Two calls. One <span className="gradient-text">API key</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
          Same workspace API key for all three. Send <span className="font-mono text-text">x-model</span> as
          genaiimg-v1, genaiimg-v2, or genaiimg-v3. Each call spends 1 credit from that model’s pack, not from
          the others. Check credits reads all balances and spends nothing.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Jump href="#generate-image" method="POST" path="/api/v1/image" title="Generate image" />
        <Jump href="#check-credits" method="GET" path="/api/v1/credits" title="Check credits" />
      </div>

      <section className="panel rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <h2 className="serif text-xl">Auth</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Create a key in API keys, then send it on every request. Credits always belong to that
          workspace.
        </p>
        <div className="mt-4 space-y-3">
          <CopyCode label="Base URL" code={BASE} />
          <CopyCode label="API key" code="Authorization: Bearer gai_YOUR_KEY" />
          <CopyCode label="Model header" code="x-model: genaiimg-v1" />
        </div>
        <p className="mt-3 text-sm text-muted">
          Or send <code className="text-brass">x-api-key</code>. Use{" "}
          <code className="text-brass">x-model: genaiimg-v2</code> or{" "}
          <code className="text-brass">x-model: genaiimg-v3</code> for those models.
        </p>
      </section>

      <section id="generate-image" className="panel scroll-mt-24 rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <EndpointHead n="1" method="POST" path="/api/v1/image" title="Generate image" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Send the source image, a prompt, and <code className="text-brass">x-model</code>. v1 uses Meta
          image edit. v2 uses OpenAI image edit. v3 uses Gemini image edit. 1 credit is taken from that
          model’s balance only if generate succeeds.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DocField
            name="x-model"
            required
            text="genaiimg-v1, genaiimg-v2, or genaiimg-v3. Required on every generate call."
          />
          <DocField name="image" required text="URL, data URL, or raw base64. image_url also works." />
          <DocField name="prompt" required text="Required string in the JSON body." />
          <DocField
            name="size"
            required
            text="Required for genaiimg-v2 only. WIDTHxHEIGHT string, e.g. 944x816."
          />
          <DocField
            name="aspectRatio"
            required
            text="Required for genaiimg-v3 only. e.g. 5:4, 16:9, 1:1. aspect_ratio also works."
          />
          <DocField
            name="x-user-email"
            text="Optional header for Activity only. Does not change whose credits are spent."
          />
          <DocField name="v1 credits" text="Deducted only when x-model is genaiimg-v1." />
          <DocField name="v2 credits" text="Deducted only when x-model is genaiimg-v2." />
          <DocField name="v3 credits" text="Deducted only when x-model is genaiimg-v3." />
        </dl>
        <div className="mt-5 space-y-4">
          <CopyCode label="curl · genaiimg-v1" code={generateCurl} />
          <CopyCode label="curl · genaiimg-v2" code={generateV2Curl} />
          <CopyCode label="curl · genaiimg-v3" code={generateV3Curl} />
          <CopyCode
            label="Success · 200"
            code={`x-credits-remaining: 35
x-model: genaiimg-v3

{ "data": [{ "b64_json": "..." }] }`}
          />
        </div>
      </section>

      <section id="check-credits" className="panel scroll-mt-24 rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <EndpointHead n="2" method="GET" path="/api/v1/credits" title="Check credits" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Returns v1, v2, and v3 balances for this API key. Optional{" "}
          <code className="text-brass">x-model</code> also returns that model’s remaining count. Do not
          send a user email. This call spends nothing.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DocField name="body" text="None. The API key is enough." />
          <DocField name="x-model" text="Optional. If sent, remaining is that model’s credits only." />
        </dl>
        <div className="mt-5 space-y-4">
          <CopyCode label="curl" code={creditsCurl} />
          <CopyCode
            label="Success · 200"
            code={`{
  "ok": true,
  "credits": { "genaiimg-v1": 36, "genaiimg-v2": 0, "genaiimg-v3": 12 },
  "hasCredits": { "genaiimg-v1": true, "genaiimg-v2": false, "genaiimg-v3": true }
}`}
          />
        </div>
      </section>

      <section className="panel rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <h2 className="serif text-xl">Errors</h2>
        <div className="mt-4 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
          <ErrorRow code="401" text="Missing or invalid API key." />
          <ErrorRow code="400" text="Missing x-model, image, or prompt." />
          <ErrorRow code="402" text="That model has 0 credits. Buy that model’s pack, then retry." />
        </div>
      </section>
    </div>
  );
}

function Jump({
  href,
  method,
  path,
  title,
}: {
  href: string;
  method: "GET" | "POST";
  path: string;
  title: string;
}) {
  return (
    <a
      href={href}
      className="panel flex items-center justify-between gap-3 rounded-2xl p-4 transition hover:bg-white/6"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block truncate font-mono text-xs text-muted">{path}</span>
      </span>
      <MethodBadge method={method} />
    </a>
  );
}

function EndpointHead({
  n,
  method,
  path,
  title,
}: {
  n: string;
  method: "GET" | "POST";
  path: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">
        {n} · {title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <MethodBadge method={method} />
        <h2 className="break-all font-mono text-sm text-text sm:text-base">{path}</h2>
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={
        method === "GET"
          ? "rounded-full bg-ok/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-ok"
          : "rounded-full bg-brass/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-brass"
      }
    >
      {method}
    </span>
  );
}

function DocField({ name, text, required }: { name: string; text: string; required?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <dt className="flex items-center gap-2 font-mono text-xs text-brass">
        {name}
        {required ? <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-text">required</span> : null}
      </dt>
      <dd className="mt-1.5 text-sm leading-6 text-muted">{text}</dd>
    </div>
  );
}

function ErrorRow({ code, text }: { code: string; text: string }) {
  return (
    <div className="flex gap-4 px-4 py-3 text-sm">
      <span className="w-10 shrink-0 font-mono text-text">{code}</span>
      <span className="text-muted">{text}</span>
    </div>
  );
}
