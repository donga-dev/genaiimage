export function UsageChart({
  data,
}: {
  data: Array<{ date: string; label: string; hits: number }>;
}) {
  const max = Math.max(1, ...data.map((item) => item.hits));

  return (
    <div className="flex h-40 items-end gap-1 sm:h-44 sm:gap-1.5">
      {data.map((item) => {
        const height = Math.max(item.hits === 0 ? 6 : (item.hits / max) * 100, 6);
        return (
          <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                title={`${item.label}: ${item.hits} image generate`}
                className="w-full rounded-t-md"
                style={{
                  height: `${height}%`,
                  opacity: item.hits === 0 ? 0.25 : 1,
                  background: "linear-gradient(180deg, #c4b5fd 0%, #4ea1ff 100%)",
                }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-muted">{item.label.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}
