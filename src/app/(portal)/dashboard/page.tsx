import Link from "next/link";
import { UsageChart } from "@/components/UsageChart";
import { requireAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { getDashboardData } from "@/lib/dashboard";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  await connectDB();
  const data = await getDashboardData(admin.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brass sm:text-sm">{BRAND.tagline}</p>
        <h1 className="serif mt-2 text-3xl md:text-4xl">
          Welcome back, <span className="gradient-text">{admin.name.split(" ")[0]}</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted md:text-base">
          {admin.companyName} · Buy v1 and v2 packs separately. Each generate uses 1 credit from that model.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="gradient-border overflow-hidden rounded-[22px] p-5 md:rounded-[28px] md:p-8">
          <p className="font-mono text-sm text-muted">genaiimg-v1</p>
          <p className="serif mt-2 text-5xl gradient-text md:text-6xl">{admin.creditsV1}</p>
          <p className="mt-3 text-sm text-muted">
            {admin.creditsV1 === 0 ? "No v1 credits. Buy a genaiimg-v1 pack." : "Used when the API sends x-model: genaiimg-v1."}
          </p>
        </div>
        <div className="gradient-border overflow-hidden rounded-[22px] p-5 md:rounded-[28px] md:p-8">
          <p className="font-mono text-sm text-muted">genaiimg-v2</p>
          <p className="serif mt-2 text-5xl gradient-text md:text-6xl">{admin.creditsV2}</p>
          <p className="mt-3 text-sm text-muted">
            {admin.creditsV2 === 0 ? "No v2 credits. Buy a genaiimg-v2 pack." : "Used when the API sends x-model: genaiimg-v2."}
          </p>
        </div>
      </section>
      <div>
        <Link href="/plans" className="btn btn-primary w-full sm:w-auto">
          Buy credits
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Current pack"
          value={admin.currentPlan?.name ?? "None"}
          hint={
            admin.currentPlan
              ? `${admin.currentPlan.model} · ₹${admin.currentPlan.pricePerCredit} per credit`
              : "Choose a credit pack"
          }
        />
        <Stat
          label="Last purchase"
          value={admin.lastPurchaseDate ? formatDate(admin.lastPurchaseDate) : "—"}
          hint={data.lastPurchase ? `${data.lastPurchase.credits} credits added` : "No purchases yet"}
        />
        <Stat label="Used today" value={String(data.todayHits)} hint={`${data.totalHits} all time`} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <HowStep step="01" title="Buy credits" text="Choose a pack. Larger packs cost less per image generate." />
        <HowStep step="02" title="Paste your API key" text="Generate a key, put it in your product, and each successful image generate uses 1 credit." />
        <HowStep step="03" title="Track everything" text="See who used it, when, and how many credits remain." />
      </section>

      <section className="panel rounded-[22px] p-4 md:rounded-[28px] md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
          <div>
            <h2 className="serif text-xl md:text-2xl">Last 14 days</h2>
            <p className="text-sm text-muted">Image generate billed to this workspace</p>
          </div>
          <Link href="/usage" className="shrink-0 text-sm text-brass hover:underline">
            Open activity
          </Link>
        </div>
        <UsageChart data={data.chart} />
      </section>

      <section className="panel rounded-[22px] p-4 md:rounded-[28px] md:p-6">
        <h2 className="serif text-xl md:text-2xl">Recent activity</h2>
        {data.recentUsage.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No image generate yet. When someone uses your product, their email will appear here.
          </p>
        ) : (
          <>
            <div className="mt-4 space-y-3 md:hidden">
              {data.recentUsage.map((row) => (
                <article key={row.id} className="rounded-2xl border border-line bg-white/4 p-4">
                  <p className="break-all text-sm font-medium">{row.userEmail}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(row.createdAt, true)}</p>
                  <p className="mt-2 text-sm text-muted">
                    {row.source ?? "image"} · {row.model ?? "genaiimg-v1"} · {row.remainingCredits} left
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-3 font-medium">When</th>
                    <th className="pb-3 font-medium">Used by</th>
                    <th className="pb-3 font-medium">Model</th>
                    <th className="pb-3 font-medium">Left after</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsage.map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <td className="py-3">{formatDate(row.createdAt, true)}</td>
                      <td className="py-3">{row.userEmail}</td>
                      <td className="py-3 text-muted">{row.model ?? "genaiimg-v1"}</td>
                      <td className="py-3">{row.remainingCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="serif mt-2 text-2xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

function HowStep({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="font-mono text-xs text-brass">{step}</p>
      <p className="serif mt-2 text-xl">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}
