import { z } from "zod";

// Shared inquiry-form validation schema (D-07). Phase 2's ContactForm uses
// this via zodResolver for CLIENT-SIDE validation only. Phase 4 (LEAD)
// imports this SAME schema verbatim for the real server action, so it stays
// a single static export, not locale-parameterized — never fork it.
// Error copy matches the UI-SPEC Copywriting Contract exactly; kept here
// (not duplicated into the next-intl catalogs) since this module is the one
// place both the client form and the server action read from.
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    company: z.string().trim().min(1, "Company is required."),
    country: z.string().trim().min(1, "Country is required."),
    // D-01: visitor picks how to be reached — email OR phone, not both
    // required (enforced by the top-level .refine() below).
    email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    // UI-SPEC §9 Form column: "min length (e.g. 20 chars)"; Copywriting
    // Contract's message-field error text doubles as the required-ness check
    // (an empty message is also < 20 chars).
    message: z
      .string()
      .trim()
      .min(20, "Please tell us a bit more (at least 20 characters).")
      .max(2000),
    // RFQ-mode fields (D-02/D-03/D-04) — optional at the schema level;
    // presence is driven by the `?product=` query param client-side, not
    // enforced here. `quantity` stays free text (e.g. "20 MT"), never
    // coerced to a number.
    product: z.string().trim().optional(),
    productName: z.string().trim().optional(),
    quantity: z.string().trim().max(200).optional(),
    destinationCountry: z.string().trim().optional(),
    incoterm: z.string().trim().optional(),
    // Honeypot decoy (LEAD-03) — real users never see or fill this field;
    // any non-empty value short-circuits the server action to a silent
    // fake-success without sending an email.
    companyWebsite: z.string().trim().max(0, "").optional().or(z.literal("")),
    // Cloudflare Turnstile token (LEAD-03) — required for the server-side
    // siteverify step; presence alone proves nothing without that check.
    turnstileToken: z.string().min(1, "Verification failed. Please try again."),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Please provide an email or phone number so we can reach you.",
    path: ["phone"],
  });

export type ContactFormValues = z.infer<typeof contactSchema>;
