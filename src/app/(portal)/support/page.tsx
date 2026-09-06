import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Ticket } from "@/models/Ticket";

export default async function SupportPage() {
  const admin = await requireAdmin();
  await connectDB();
  const tickets = await Ticket.find({ adminId: admin.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Support</p>
        <h1 className="serif mt-2 text-4xl gradient-text">Your tickets</h1>
        <p className="mt-2 text-muted">
          Ask Chat to create a ticket when something is stuck, like buying credits. It will appear here
          with a ticket code.
        </p>
        <Link href="/chat" className="btn btn-primary mt-5 px-4 py-2 text-sm">
          Open Chat
        </Link>
      </div>

      <section className="panel rounded-[28px] p-6">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted">No tickets yet. Open Chat and ask to create a support ticket.</p>
            <Link href="/chat" className="btn btn-ghost px-4 py-2 text-sm">
              Ask Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <article key={ticket._id.toString()} className="rounded-2xl border border-line bg-white/4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm text-brass">{ticket.code}</p>
                  <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs capitalize text-muted">
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{ticket.subject}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{ticket.message}</p>
                <p className="mt-3 text-xs text-muted">{formatDate(ticket.createdAt, true)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
