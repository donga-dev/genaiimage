import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function PublicHeader({ active }: { active?: "docs" | "login" | "signup" }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0b0c10]/80 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-12">
        <Link href="/login" className="min-w-0">
          <Logo compact className="sm:hidden" />
          <Logo className="hidden sm:flex" />
        </Link>
        <nav className="flex shrink-0 items-center gap-2">
          <Link
            href="/docs"
            className={cn(
              "inline-flex h-10 items-center rounded-full px-3.5 text-sm font-medium",
              active === "docs"
                ? "bg-white/12 text-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                : "text-text/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/8",
            )}
          >
            API docs
          </Link>
          <Link href="/login" className="btn btn-primary h-10 px-4 text-sm">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
