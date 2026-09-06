import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getUsagePageData } from "@/lib/dashboard";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type Search = Promise<{ from?: string; to?: string; q?: string; page?: string }>;

export default async function UsagePage({ searchParams }: { searchParams: Search }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  await connectDB();
  const data = await getUsagePageData(admin.id, {
    from: params.from,
    to: params.to,
    q: params.q,
    page,
  });

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Activity</p>
        <h1 className="serif mt-2 text-4xl gradient-text">Image generate</h1>
        <p className="mt-2 text-muted">
          Each image generate stores the user email, the time, and credits left.
        </p>
      </div>

      <form className="panel grid gap-3 rounded-3xl p-5 md:grid-cols-[1fr_1fr_1.4fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted">From</span>
          <input className="input" type="date" name="from" defaultValue={params.from} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted">To</span>
          <input className="input" type="date" name="to" defaultValue={params.to} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted">User email</span>
          <input className="input" name="q" placeholder="user@client.com" defaultValue={params.q} />
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full">
            Filter
          </button>
        </div>
      </form>

      <section className="panel rounded-[28px] p-6">
        <p className="mb-4 text-sm text-muted">{data.total} records</p>
        {data.items.length === 0 ? (
          <p className="text-sm text-muted">No image generate matches these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Used by</th>
                  <th className="pb-3 font-medium">Credits used</th>
                  <th className="pb-3 font-medium">Remaining</th>
                  <th className="pb-3 font-medium">Feature</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-3">{formatDate(row.createdAt, true)}</td>
                    <td className="py-3">{row.userEmail}</td>
                    <td className="py-3">{row.creditsUsed}</td>
                    <td className="py-3">{row.remainingCredits}</td>
                    <td className="py-3 text-muted">{row.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.totalPages > 1 ? (
          <div className="mt-6 flex gap-3">
            {page > 1 ? (
              <Link
                href={`/usage?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page - 1) })}`}
                className="btn btn-ghost"
              >
                Previous
              </Link>
            ) : null}
            {page < data.totalPages ? (
              <Link
                href={`/usage?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page + 1) })}`}
                className="btn btn-ghost"
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
