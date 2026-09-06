import { BuyPlanButton } from "@/components/BuyPlanButton";
import { requireAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { connectDB } from "@/lib/db";
import { serializePlan } from "@/lib/serialize";
import { cn, formatINR } from "@/lib/utils";
import { Plan } from "@/models/Plan";

const uses = [{ title: "Image generate", text: "Create images from a prompt." }];

export default async function PlansPage() {
  const admin = await requireAdmin();
  await connectDB();
  const plans = (await Plan.find({ isActive: true }).sort({ sortOrder: 1 }).lean()).map(serializePlan);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="gradient-border overflow-hidden rounded-[32px] p-6 md:p-10">
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Credit packs</p>
        <h1 className="serif mt-3 max-w-3xl text-4xl md:text-5xl">
          This is where your company buys credits on{" "}
          <span className="gradient-text">{BRAND.name}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Pay here in packs. Every image generate in your product uses 1 credit.
        </p>
        <div className="mt-8 grid gap-3 sm:max-w-md">
          {uses.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="serif text-lg">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Pick a pack</p>
        <h2 className="serif mt-2 text-3xl">Choose a credit pack</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Larger packs cost less per credit. Pay with Razorpay. Credits stay until your team uses
          them — no monthly lock-in.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="panel rounded-3xl p-8 text-muted">
          Credit packs are being prepared. Please check back in a moment.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const featured = plan.slug === "bulk";
            return (
              <article
                key={plan.id}
                className={cn("flex flex-col rounded-[28px] p-6", featured ? "gradient-border" : "panel")}
              >
                <div className="flex items-center justify-between">
                  <h3 className="serif text-2xl">{plan.name}</h3>
                  {featured ? (
                    <span className="rounded-full bg-[linear-gradient(135deg,#4ea1ff,#8b7cff,#f472b6)] px-2.5 py-1 text-[11px] font-medium text-white">
                      Best value
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 serif text-5xl gradient-text">
                  {formatINR(plan.pricePerCredit)}
                  <span className="ml-1 text-base font-medium tracking-normal text-muted">/ credit</span>
                </p>
                <p className="mt-3 text-sm text-muted">{plan.description}</p>
                <ul className="mt-6 mb-8 space-y-2 text-sm text-muted">
                  <li className="text-text">{plan.credits} image generates after payment</li>
                  <li>Pack total {formatINR(plan.totalPrice)}</li>
                  <li>Works for image generate</li>
                </ul>
                <div className="mt-auto">
                  <BuyPlanButton
                    plan={plan}
                    admin={{ name: admin.name, email: admin.email, phone: admin.phone }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
