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
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">{BRAND.tagline}</p>
        <h1 className="serif mt-2 text-4xl">
          Welcome back, <span className="gradient-text">{admin.name.split(" ")[0]}</span>
        </h1>
        <p className="mt-2 text-muted">
          {admin.companyName} · Buy credits here. Each image generate uses one.
        </p>
      </div>

      <section className="gradient-border overflow-hidden rounded-[28px] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-muted">AI credits remaining</p>
            <p className="serif mt-2 text-6xl gradient-text">{admin.credits}</p>
            <p className="mt-3 text-sm text-muted">
              {admin.credits === 0
                ? "Your workspace is out of credits. Buy a pack to keep image generate running."
                : "Each image generate uses 1 credit."}
            </p>
          </div>
          <Link href="/plans" className="btn btn-primary">
            Buy credits
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Current pack"
          value={admin.currentPlan?.name ?? "None"}
          hint={admin.currentPlan ? `₹${admin.currentPlan.pricePerCredit} per credit` : "Choose a credit pack"}
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

      <section className="panel rounded-[28px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="serif text-2xl">Last 14 days</h2>
            <p className="text-sm text-muted">Image generate billed to this workspace</p>
          </div>
          <Link href="/usage" className="text-sm text-brass hover:underline">
            Open activity
          </Link>
        </div>
        <UsageChart data={data.chart} />
      </section>

      <section className="panel rounded-[28px] p-6">
        <h2 className="serif text-2xl">Recent activity</h2>
        {data.recentUsage.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No image generate yet. When someone uses your product, their email will appear here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">When</th>
                  <th className="pb-3 font-medium">Used by</th>
                  <th className="pb-3 font-medium">Feature</th>
                  <th className="pb-3 font-medium">Left after</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsage.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-3">{formatDate(row.createdAt, true)}</td>
                    <td className="py-3">{row.userEmail}</td>
                    <td className="py-3 text-muted">{row.source ?? "—"}</td>
                    <td className="py-3">{row.remainingCredits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
