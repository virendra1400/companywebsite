"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

import { LeadNotification } from "@/emails/LeadNotification";

import { contactSchema } from "./contact-schema";
import { notifyCrm } from "./crm-webhook";
import { checkRateLimit } from "./rate-limit";

// Constructed at module scope with a placeholder fallback so a missing
// RESEND_API_KEY never crashes the module at import time — the real gate is
// the explicit env check before send() below, which returns a typed error
// instead of throwing (graceful-failure, LEAD-04 Environment Availability).
const resend = new Resend(process.env.RESEND_API_KEY || "re_not_configured");

export type SubmitResult =
  | { status: "success" }
  | { status: "error"; message: "network" | "rate-limited" };

// Real users never see or fill the `companyWebsite` decoy field. Checked on
// the RAW payload, before schema validation — contactSchema's max(0)
// constraint on this field would otherwise turn a bot-filled honeypot into
// a generic validation failure instead of the required silent
// fake-success (never reveal detection to the sender).
function readHoneypot(raw: unknown): string {
  if (raw && typeof raw === "object" && "companyWebsite" in raw) {
    const value = (raw as Record<string, unknown>).companyWebsite;
    return typeof value === "string" ? value.trim() : "";
  }
  return "";
}

// T-109/PROMPT_LIBRARY P-07: `[RFQ] {products} — {company}, {country}` when
// there's real product context (either the multi-select or a single
// query-param-prefilled product), plain "New inquiry" otherwise.
function buildSubject(data: {
  product?: string;
  productName?: string;
  productsInterested?: string[];
  company: string;
  country: string;
}): string {
  const products =
    data.productsInterested && data.productsInterested.length > 0
      ? data.productsInterested.join(", ")
      : (data.productName ?? data.product);
  if (!products) return "New inquiry";
  return `[RFQ] ${products} — ${data.company}, ${data.country}`;
}

// Composes the spam-defense + delivery pipeline in cheapest-reject-first
// order: honeypot (free, synchronous) -> rate-limit (in-memory lookup) ->
// Turnstile siteverify (external API round-trip) -> resend.emails.send ->
// fire-and-forget notifyCrm.
export async function submitContactForm(raw: unknown): Promise<SubmitResult> {
  if (readHoneypot(raw)) return { status: "success" };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: "network" };
  const data = parsed.data;

  // headers() is async since Next.js 15 (Pitfall 5) — must be awaited.
  // Use the LAST x-forwarded-for entry, not the first: a client can send its
  // own X-Forwarded-For header, and Vercel's edge appends the true connecting
  // IP rather than replacing it — the first entry is attacker-controlled and
  // trivially spoofable per-request, defeating the rate limiter entirely.
  // ponytail: trusts Vercel as the sole fronting proxy (single-hop edge); a
  // multi-proxy chain would need real trusted-proxy-chain validation.
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",").pop()?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return { status: "error", message: "rate-limited" };
  }

  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: data.turnstileToken,
      remoteip: ip,
    }),
  }).then((r) => r.json());
  if (!verify.success) return { status: "error", message: "network" };

  if (!process.env.RESEND_API_KEY) {
    // No live Resend credentials configured yet — fail gracefully.
    return { status: "error", message: "network" };
  }

  try {
    await resend.emails.send({
      // from/to are FIXED server-side constants — never derived from user
      // input (T-04-03 email-header-injection mitigation). Only the
      // subject line includes user data.
      from: process.env.RESEND_FROM_ADDRESS!,
      to: process.env.SALES_INBOX_ADDRESS!,
      subject: buildSubject(data),
      react: LeadNotification(data),
    });
  } catch {
    return { status: "error", message: "network" };
  }

  // Fire-and-forget: a CRM outage must never fail a delivered lead.
  void notifyCrm(data);

  return { status: "success" };
}
