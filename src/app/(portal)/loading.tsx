export default function PortalLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-full bg-white/8" />
      <div className="h-40 animate-pulse rounded-[28px] bg-white/6" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
      </div>
    </div>
  );
}
