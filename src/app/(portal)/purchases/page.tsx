import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializePurchase } from "@/lib/serialize";
import { cn, formatDate, formatINR } from "@/lib/utils";
import { Purchase } from "@/models/Purchase";

const statusLabel: Record<string, string> = {
  completed: "Paid",
  pending: "Pending",
  failed: "Failed",
};

export default async function PurchasesPage() {
  const admin = await requireAdmin();
  await connectDB();
  const purchases = (await Purchase.find({ adminId: admin.id }).sort({ purchasedAt: -1 }).lean()).map(
    serializePurchase,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Billing</p>
        <h1 className="serif mt-2 text-4xl gradient-text">Credit purchases</h1>
        <p className="mt-2 text-muted">Every Razorpay payment for AI credit packs on this workspace.</p>
      </div>

      <section className="panel rounded-[28px] p-6">
        {purchases.length === 0 ? (
          <p className="text-sm text-muted">No purchases yet. Buy a pack from Credit packs.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Pack</th>
                  <th className="pb-3 font-medium">Credits</th>
                  <th className="pb-3 font-medium">Paid</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment id</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-3">{formatDate(row.purchasedAt, true)}</td>
                    <td className="py-3">{row.planName}</td>
                    <td className="py-3">{row.credits}</td>
                    <td className="py-3">{formatINR(row.amountPaid)}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs",
                          row.status === "completed" && "bg-ok/15 text-ok",
                          row.status === "pending" && "bg-white/5 text-muted",
                          row.status === "failed" && "bg-danger/15 text-danger",
                        )}
                      >
                        {statusLabel[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs text-muted">{row.razorpayPaymentId ?? "—"}</td>
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
