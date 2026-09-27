import { PlanCatalog } from "@/components/PlanCatalog";
import { requireAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { listActivePlans } from "@/lib/portal-cache";

export default async function PlansPage() {
  const [admin, plans] = await Promise.all([requireAdmin(), listActivePlans()]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
      <section className="gradient-border overflow-hidden rounded-[22px] p-5 md:rounded-[32px] md:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-brass sm:text-sm">Credit packs</p>
        <h1 className="serif mt-3 max-w-3xl text-3xl leading-tight md:text-5xl">
          This is where your company buys credits on{" "}
          <span className="gradient-text">{BRAND.name}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
          Pick a model first, then a pack. Every image generate in your product uses 1 credit.
        </p>
      </section>

      <PlanCatalog
        plans={plans}
        admin={{ name: admin.name, email: admin.email, phone: admin.phone }}
      />
    </div>
  );
}
