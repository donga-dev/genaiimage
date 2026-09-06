"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { formatINR } from "@/lib/utils";
import type { PublicPlan } from "@/types";

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function BuyPlanButton({
  plan,
  admin,
}: {
  plan: PublicPlan;
  admin: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function buy() {
    setPending(true);
    setMessage(null);

    try {
      const orderResponse = await fetch("/api/purchases/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const order = (await orderResponse.json()) as {
        ok: boolean;
        message?: string;
        keyId?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
      };

      if (!order.ok || !order.keyId || !order.orderId || !order.amount) {
        setMessage({ type: "error", text: order.message ?? "Could not start payment" });
        setPending(false);
        return;
      }

      await loadRazorpay();

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: BRAND.name,
        description: `${plan.name} · ${plan.credits} AI credits`,
        order_id: order.orderId,
        prefill: {
          name: admin.name,
          email: admin.email,
          contact: admin.phone.replace(/^\+91/, ""),
        },
        notes: {
          plan: plan.slug,
        },
        theme: { color: "#6d5efc" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/purchases/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = (await verifyResponse.json()) as {
              ok: boolean;
              message?: string;
              creditsAdded?: number;
            };

            if (!result.ok) {
              setMessage({ type: "error", text: result.message ?? "Payment could not be verified" });
              setPending(false);
              return;
            }

            setMessage({
              type: "ok",
              text: `${result.creditsAdded || plan.credits} credits added after payment`,
            });
            setPending(false);
            router.refresh();
          } catch {
            setMessage({ type: "error", text: "Payment succeeded but verification failed. Refresh in a moment." });
            setPending(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPending(false);
            setMessage({ type: "error", text: "Payment cancelled" });
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        setMessage({ type: "error", text: response.error?.description ?? "Payment failed" });
        setPending(false);
      });

      checkout.open();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not open Razorpay",
      });
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={buy} disabled={pending} className="btn btn-primary w-full">
        {pending ? "Opening Razorpay…" : `Pay ${formatINR(plan.totalPrice)}`}
      </button>
      {message ? (
        <p className={`text-center text-sm ${message.type === "ok" ? "text-ok" : "text-danger"}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
