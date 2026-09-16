"use client";

import { useMemo, useState } from "react";
import { BuyPlanButton } from "@/components/BuyPlanButton";
import { IMAGE_MODELS, type ImageModelId } from "@/lib/image-models";
import { cn, formatINR } from "@/lib/utils";
import type { PublicPlan } from "@/types";

export function PlanCatalog({
  plans,
  admin,
}: {
  plans: PublicPlan[];
  admin: { name: string; email: string; phone: string };
}) {
  const [model, setModel] = useState<ImageModelId>("genaiimg-v1");
  const visible = useMemo(
    () => plans.filter((plan) => plan.model === model).sort((left, right) => left.sortOrder - right.sortOrder),
    [plans, model],
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Choose a model</p>
        <h2 className="serif mt-2 text-2xl md:text-3xl">genaiimg-v1 or genaiimg-v2</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Pack prices follow the model you pick. v2 costs more than v1.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {IMAGE_MODELS.map((id) => {
            const selected = model === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setModel(id)}
                className={cn(
                  "rounded-[22px] p-5 text-left transition md:rounded-[28px]",
                  selected ? "gradient-border" : "panel hover:bg-white/6",
                )}
              >
                <p className="font-mono text-lg">{id}</p>
                <p className="mt-1 text-sm text-muted">
                  {id === "genaiimg-v1" ? "Standard model" : "Newer model"}
                </p>
                {selected ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-brass">Selected</p>
                ) : (
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Tap to view packs</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Pick a pack</p>
        <h2 className="serif mt-2 text-2xl md:text-3xl">Choose a credit pack</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Prices below are for <span className="font-mono text-text">{model}</span>. Larger packs cost less per
          credit. Pay with Razorpay. Credits stay until your team uses them.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="panel rounded-3xl p-8 text-muted">
          Credit packs for this model are being prepared. Please check back in a moment.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {visible.map((plan) => {
            const featured = plan.slug === "bulk" || plan.slug === "bulk-v2";
            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-[22px] p-5 md:rounded-[28px] md:p-6",
                  featured ? "gradient-border" : "panel",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="serif text-2xl">{plan.name}</h3>
                  {featured ? (
                    <span className="rounded-full bg-[linear-gradient(135deg,#4ea1ff,#8b7cff,#f472b6)] px-2.5 py-1 text-[11px] font-medium text-white">
                      Best value
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-xs text-muted">{plan.model}</p>
                <p className="mt-4 serif text-4xl gradient-text md:text-5xl">
                  {formatINR(plan.pricePerCredit)}
                  <span className="ml-1 text-base font-medium tracking-normal text-muted">/ credit</span>
                </p>
                <p className="mt-3 text-sm text-muted">
                  {plan.credits} credits at {formatINR(plan.pricePerCredit)} per credit.
                </p>
                <ul className="mt-6 mb-8 space-y-2 text-sm text-muted">
                  <li className="text-text">{plan.credits} image generates after payment</li>
                  <li>Pack total {formatINR(plan.credits * plan.pricePerCredit)}</li>
                  <li>Works for {plan.model}</li>
                </ul>
                <div className="mt-auto">
                  <BuyPlanButton plan={plan} admin={admin} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
