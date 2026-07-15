import { z } from "zod";

// Shared inquiry-form validation schema (D-07). Phase 2's ContactForm uses
// this via zodResolver for CLIENT-SIDE validation only — no network call.
// Phase 4 (LEAD) imports this SAME schema verbatim for the real server
// action, so it stays a single static export, not locale-parameterized.
// Error copy matches the UI-SPEC Copywriting Contract exactly; kept here
// (not duplicated into the next-intl catalogs) since this module is the one
// place both the client stub and the future server action read from.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  company: z.string().trim().min(1, "Company is required."),
  country: z.string().trim().min(1, "Country is required."),
  // UI-SPEC §9 Form column: "min length (e.g. 20 chars)"; Copywriting
  // Contract's message-field error text doubles as the required-ness check
  // (an empty message is also < 20 chars).
  message: z
    .string()
    .trim()
    .min(20, "Please tell us a bit more (at least 20 characters).")
    .max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
