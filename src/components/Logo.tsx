import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 shadow-[0_0_24px_rgba(138,180,255,0.25)]">
        <span
          className="h-6 w-6 rounded-full"
          style={{
            background:
              "conic-gradient(from 210deg, #4ea1ff, #8b7cff, #f472b6, #fb923c, #4ea1ff)",
          }}
        />
        <span className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_12px_white]" />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block font-medium tracking-[0.2em] text-[10px] text-brass">
            {BRAND.tagline.toUpperCase()}
          </span>
          <span className="serif block text-[1.35rem] tracking-tight">{BRAND.name}</span>
        </span>
      ) : null}
    </div>
  );
}
