// CRM webhook stub (LEAD-05). No CRM vendor is chosen yet — this single
// internal function is the one call site a future real CRM integration
// replaces the internals of, without touching contact-action.ts. No-ops
// when CRM_WEBHOOK_URL is unset; fire-and-forget from the caller, so a CRM
// outage must never fail or delay a delivered lead email.
export async function notifyCrm(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return; // no-op until a real CRM is wired
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Swallow errors — a CRM outage must never surface as a lead-submission
    // failure to the visitor. Consider logging to observability later.
  }
}
