import { CopyCode } from "@/components/CopyCode";
import { BRAND } from "@/lib/brand";

const BASE = BRAND.url;

const generateCurl = `curl -X POST "${BASE}/api/v1/image" \\
  -H "Authorization: Bearer gai_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "x-user-email: artist@client.com" \\
  -d "{\\"image\\":\\"https://example.com/source.png\\",\\"prompt\\":\\"your prompt here\\"}"`;

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
          Generate image spends 1 workspace credit on success. Check credits only reads the workspace
          balance — not an end-user, and it spends nothing.
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
          <CopyCode label="Header" code="Authorization: Bearer gai_YOUR_KEY" />
        </div>
        <p className="mt-3 text-sm text-muted">
          Or send <code className="text-brass">x-api-key: gai_YOUR_KEY</code>
        </p>
      </section>

      <section id="generate-image" className="panel scroll-mt-24 rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <EndpointHead n="1" method="POST" path="/api/v1/image" title="Generate image" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Send the source image and a prompt. 1 credit is taken only if generate succeeds. A failed
          call returns the credit.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DocField name="image" required text="URL, data URL, or raw base64. image_url also works." />
          <DocField name="prompt" required text="Required string in the JSON body." />
          <DocField
            name="x-user-email"
            text="Optional header for Activity only. Does not change whose credits are spent."
          />
          <DocField name="credits" text="Always 1 workspace credit per successful generate." />
        </dl>
        <div className="mt-5 space-y-4">
          <CopyCode label="curl" code={generateCurl} />
          <CopyCode
            label="Success · 200"
            code={`x-credits-remaining: 35

{ "data": [{ "b64_json": "..." }] }`}
          />
        </div>
      </section>

      <section id="check-credits" className="panel scroll-mt-24 rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <EndpointHead n="2" method="GET" path="/api/v1/credits" title="Check credits" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Returns the workspace balance for this API key. Do not send a user email. POST to the same
          URL also works. This call does not spend credits.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DocField name="body" text="None. The API key is enough." />
          <DocField name="spends credits" text="No. This is a balance read." />
        </dl>
        <div className="mt-5 space-y-4">
          <CopyCode label="curl" code={creditsCurl} />
          <CopyCode
            label="Success · 200"
            code={`{
  "ok": true,
  "credits": 36,
  "hasCredits": true
}`}
          />
        </div>
      </section>

      <section className="panel rounded-[22px] p-5 md:rounded-[28px] md:p-6">
        <h2 className="serif text-xl">Errors</h2>
        <div className="mt-4 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
          <ErrorRow code="401" text="Missing or invalid API key." />
          <ErrorRow code="400" text="Generate image is missing image or prompt." />
          <ErrorRow code="402" text="Workspace has 0 credits. Buy a pack, then retry generate." />
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
