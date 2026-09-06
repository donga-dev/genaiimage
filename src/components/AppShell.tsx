"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  { href: "/keys", label: "API keys" },
  { href: "/profile", label: "Workspace" },
];

export function AppShell({ admin, children }: { admin: PublicAdmin; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      <aside
        className={cn(
          "relative fixed inset-y-0 left-0 z-40 w-[272px] border-r border-line bg-[#101218]/80 p-5 backdrop-blur-2xl transition-transform md:static md:min-h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Logo />
        <div className="gradient-border mt-8 rounded-3xl px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Credits left</p>
          <p className="serif mt-1 text-4xl gradient-text">{admin.credits}</p>
          <p className="mt-1 text-xs text-muted">
            {admin.currentPlan ? admin.currentPlan.name : "No pack purchased yet"}
          </p>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
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
        <div className="absolute inset-x-5 bottom-5">
          <p className="mb-3 truncate text-xs text-muted">{admin.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-[#0b0c10]/55 px-4 py-3 backdrop-blur-2xl lg:px-8">
          <button type="button" className="btn btn-ghost px-3 py-2 md:hidden" onClick={() => setOpen(true)}>
            Menu
          </button>
          <div className="hidden md:block">
            <p className="text-sm text-muted">
              {admin.companyName} · {admin.name}
            </p>
          </div>
          <div className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-right text-sm">
            <p className="text-[11px] text-muted">Balance</p>
            <p className="font-medium gradient-text">{admin.credits} credits</p>
          </div>
        </header>
        <main
          className={cn(
            pathname === "/chat"
              ? "flex min-h-0 flex-1 flex-col p-3 md:p-4"
              : "px-4 py-8 lg:px-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
