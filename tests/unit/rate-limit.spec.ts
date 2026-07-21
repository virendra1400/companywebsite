import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// checkRateLimit is a module-scoped Map keyed by client IP (Pattern 2,
// RESEARCH.md). Each test uses a fresh key so the module's shared state
// from a prior test never leaks into the next assertion.
const { checkRateLimit } = await import("@/lib/rate-limit");

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first MAX_PER_WINDOW (3) calls and rejects the 4th", () => {
    const key = "203.0.113.1";
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(false);
  });

  it("starts a fresh window with count reset to 1 once resetAt has passed", () => {
    const key = "203.0.113.2";
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(false);

    // Advance past the 60s window.
    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit(key)).toBe(true);
    // Fresh window count is 1, so 2 more still succeed before the 4th fails.
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(true);
    expect(checkRateLimit(key)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    const keyA = "203.0.113.3";
    const keyB = "203.0.113.4";
    expect(checkRateLimit(keyA)).toBe(true);
    expect(checkRateLimit(keyA)).toBe(true);
    expect(checkRateLimit(keyA)).toBe(true);
    expect(checkRateLimit(keyA)).toBe(false);

    // keyB has never been seen — starts its own fresh window.
    expect(checkRateLimit(keyB)).toBe(true);
  });
});
