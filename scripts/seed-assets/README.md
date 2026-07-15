# Seed Assets — Placeholder Only

The files in this directory are **self-authored, generated placeholder assets** used only to
seed local development / preview data for the Certifications collection. They are **not**
real certification-body logos, marks, or documents.

- `logo-iso-22000.svg`, `logo-food-safety.svg`, `logo-halal.svg` — plain generic labeled boxes
  (rectangle + sans-serif text), generated for this project. They do **not** reproduce the
  ISO, FSSC, Halal, FSSAI, or any other real certification body's trademarked logo, seal, or
  visual identity.
- `sample-certificate.pdf` — a minimal, single-page generated PDF containing only the text
  "SAMPLE CERTIFICATE - PLACEHOLDER DOCUMENT". It contains no real certificate number,
  registration number, IEC number, signature, or named client.

**Do not replace these with scraped/downloaded real certification-body logos or documents.**
When the company's real certifications and signed PDFs become available, replace both the
seeded `Certifications` collection entries (via `/admin` or `scripts/seed-pages.ts`) and these
asset files with the real, licensed assets — see `02-CONTEXT.md` D-03 and the legal caution
in `PITFALLS.md` Pitfall 9 (never fabricate specific certification numbers, client logos, or
unverifiable claims).
