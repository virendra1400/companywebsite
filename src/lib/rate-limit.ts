// In-memory best-effort rate limiter (LEAD-03), one of three spam-defense
// layers composed in contact-action.ts — cheap in-memory lookup, run before
// the more expensive Turnstile network round-trip.
//
// Documented limitation: this Map lives in a single serverless function
// instance's memory. On Vercel, concurrent invocations may spin up multiple
// instances, each with its own empty Map, so this is a best-effort throttle,
// not a hard guarantee, under real concurrent traffic. Deliberate MVP
// tradeoff (no Redis provisioned) — upgrade path is Upstash Redis +
// @upstash/ratelimit via the Vercel Marketplace integration if launch
// traffic ever justifies it.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}
