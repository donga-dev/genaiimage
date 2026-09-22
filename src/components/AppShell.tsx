"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "@/lib/utils";
import type { PublicAdmin } from "@/types";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/chat", label: "Chat" },
  { href: "/plans", label: "Buy credits" },
  { href: "/usage", label: "Activity" },
  { href: "/purchases", label: "Billing" },
  { href: "/support", label: "Support" },
  { href: "/docs", label: "API docs" },
  { href: "/keys", label: "API keys" },
  { href: "/profile", label: "Workspace" },
];

export function AppShell({ admin, children }: { admin: PublicAdmin; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pageLabel = links.find((link) => link.href === pathname)?.label ?? "GenAI Img";
  const isChat = pathname === "/chat";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[272px_minmax(0,1fr)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(18rem,86vw)] flex-col border-r border-line bg-[#101218]/95 p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-2xl transition-transform duration-200 md:static md:min-h-dvh md:w-auto md:translate-x-0 md:bg-[#101218]/80",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <Logo />
        <div className="gradient-border mt-6 shrink-0 rounded-3xl px-4 py-4 md:mt-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Credits left</p>
          <ul className="mt-3 space-y-2.5">
            {(
              [
                ["v1", admin.creditsV1],
                ["v2", admin.creditsV2],
                ["v3", admin.creditsV3],
              ] as const
            ).map(([label, value]) => (
              <li key={label} className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>
                <span className="serif text-[1.65rem] leading-none tabular-nums gradient-text">{value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 truncate text-xs text-muted">
            {admin.currentPlan ? `${admin.currentPlan.name} · ${admin.currentPlan.model}` : "No pack purchased yet"}
          </p>
        </div>
        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto md:mt-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-full px-3.5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-muted hover:bg-white/5 hover:text-text",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 shrink-0">
          <p className="mb-3 truncate text-xs text-muted">{admin.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/55 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className={cn("flex min-h-dvh min-w-0 flex-col", isChat && "h-dvh overflow-hidden")}>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-[#0b0c10]/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-2xl lg:px-8">
          <button
            type="button"
            className="btn btn-ghost min-h-11 min-w-11 px-3 py-2 md:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-medium md:hidden">{pageLabel}</p>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm text-muted">
              {admin.companyName} · {admin.name}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-line bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Balance</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {(
                [
                  ["v1", admin.creditsV1],
                  ["v2", admin.creditsV2],
                  ["v3", admin.creditsV3],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] text-muted">{label}</span>
                  <span className="text-sm font-medium tabular-nums gradient-text">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </header>
        <main
          className={cn(
            isChat
              ? "flex min-h-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4"
              : "flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:px-8 lg:py-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
