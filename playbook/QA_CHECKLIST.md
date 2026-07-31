# QA_CHECKLIST — VNP Global

Run the relevant section before marking ANY task done. "Done" without evidence = not done. Record results in the task's PR/notes.

## A. Honesty & Content (run on EVERY content-touching task — highest priority)

- [ ] No fabricated numbers: buyer counts, countries served, shipments, years of experience, capacity not in PROJECT_MEMORY
- [ ] "Trusted by 60+ international buyers" and derivatives ABSENT from entire site (grep for "60+", "trusted by", "clients")
- [ ] No testimonials, client logos, ratings, or case studies (until real ones exist and are logged in DECISION_LOG)
- [ ] Certifications rendered with status badges; none shown as "certified/held" without a real number
- [ ] IQF wording matches D-14 (no in-house IQF line claim)
- [ ] All unresolved facts use `{{TOKEN}}` placeholders registered in DECISION_LOG §Open Placeholders
- [ ] Banned words absent (world-class, best-in-class, leading, state-of-the-art, one-stop…) — see CONTENT_PLAYBOOK §1
- [ ] Every claim traceable to PROJECT_MEMORY, owner input, or placeholder

## B. Design System Compliance

- [ ] Only DESIGN_SYSTEM tokens used (no ad-hoc hex/spacing values)
- [ ] `--lime-500` never used as text on light bg; gold never as text on white
- [ ] One gold primary CTA per viewport; CTA strings exactly per CONTENT_PLAYBOOK §3
- [ ] Typography: Fraunces display / Archivo body; scale steps only; one H1
- [ ] Section rhythm per C-06; max one dark band per page
- [ ] No carousels, no parallax, no autoplay-with-sound anywhere

## C. Accessibility (WCAG 2.1 AA)

- [ ] axe DevTools (or equivalent) scan: 0 critical/serious issues
- [ ] Keyboard-only walkthrough: all nav, mega-menu, mobile overlay (focus trap + Esc), forms, skip-link
- [ ] Focus visible on every interactive element (gold outline spec)
- [ ] Heading order valid (no skips); landmarks present
- [ ] All images: meaningful alt or alt=""; form fields: visible labels + described errors
- [ ] Contrast spot-check on any new color pairing (4.5:1 body / 3:1 large)
- [ ] `prefers-reduced-motion` honored (entry animations off)
- [ ] Touch targets ≥44px; page usable at 200% zoom and 320px width

## D. SEO & Technical

- [ ] Title + meta description per SEO_PLAYBOOK templates (length checked)
- [ ] Canonical, OG tags, correct H1
- [ ] JSON-LD present & valid (Rich Results test): Organization site-wide; Product+Breadcrumb+FAQ where applicable; NO fake ratings/offers
- [ ] URLs match locked structure (E-01); redirects for changed URLs
- [ ] sitemap.xml updated; robots.txt sane
- [ ] Images: AVIF/WebP, srcset, width/height set, descriptive filenames, lazy below fold

## E. Performance (test 4× CPU throttle, Fast 3G, mobile viewport)

- [ ] Lighthouse mobile: Performance ≥90, LCP <2.5s, CLS <0.1, INP <200ms
- [ ] Hero image preloaded; fonts subset + `font-display: swap` with size-adjusted fallback
- [ ] JS bundle audited — no unused libraries (no slider/carousel libs, moment, lodash-full)
- [ ] No layout shift from fonts, images, or late-loading badges

## F. Responsive & Cross-Browser

- [ ] 320 / 375 / 768 / 1024 / 1440 widths checked
- [ ] Spec tables collapse to cards <768px (no horizontal scroll)
- [ ] Sticky mobile CTA bar on product pages works, doesn't cover content bottom
- [ ] Chrome, Safari (iOS), Firefox, Edge smoke test
- [ ] Logical properties used (no `margin-left` where `margin-inline-start` belongs — RTL readiness)

## G. Forms & Conversion

- [ ] RFQ form: field set matches C-18 schema exactly (E-05 — do not alter without DECISION_LOG entry)
- [ ] Validation: inline, specific messages, a11y-wired (aria-describedby)
- [ ] Submit → email arrives with structured subject; success state shows SLA + WhatsApp fallback
- [ ] Product pre-selection via query param works from every CTA band
- [ ] WhatsApp deep links open with correct prefilled text (test on real phone)
- [ ] Honeypot/time-trap present; no CAPTCHA
- [ ] Analytics events fire: rfq_submit, sample_request, whatsapp_click, spec_download, tour_request

## H. i18n Readiness (structural, until Arabic ships)

- [ ] No hardcoded strings inside components (strings in content layer/CMS)
- [ ] Layout survives `dir="rtl"` smoke test (flip and eyeball key pages)
- [ ] Empty language dropdown removed (D-08)

## I. Pre-Launch Gate (run once, before site is shared with any buyer)

- [ ] All Open Placeholders in DECISION_LOG resolved or the section containing them hidden
- [ ] Certification numbers real for anything displayed as "Registered"
- [ ] Founder block has real name/photo/bio
- [ ] All product images correct product (no wheat-for-peas)
- [ ] Contact channels tested end-to-end (form email received, phone rings, WhatsApp answers)
- [ ] Spec sheet PDFs exist and download for all 8 products
- [ ] Legal identity footer strip populated (CIN/GST/IEC/FSSAI)
- [ ] 404 works; no orphan/placeholder pages reachable ("Insights" hidden if empty)
- [ ] Search Console verified, sitemap submitted, analytics live
