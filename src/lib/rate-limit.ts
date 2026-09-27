const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

export function rateLimit(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
