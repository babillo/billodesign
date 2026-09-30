// Best-effort, per-instance rate limiting for route handlers (ADR-004).
// Serverless instances don't share memory, so this stops bursts, not a
// determined attacker spread across instances; see docs/decisions.md.

export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();
  return function isLimited(key: string) {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };
}

/** Visitor IP as reported by Vercel's proxy (first entry of x-forwarded-for). */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
