# Phase 3: Product Catalog - Discussion Log

> Audit trail only. Decisions in CONTEXT.md.

**Date:** 2026-07-15
**Phase:** 3-Product Catalog
**Areas discussed:** Category model, Product model, Catalog index UX, Specs format

## Category model
- Flat categories ✓ | Nested tree ✗ → single-level Categories collection.

## Product model
- Typed fields ✓ | Block page-builder ✗ → structured Products collection (relations to Categories + Certifications + Media).

## Catalog index
- Grouped by category ✓ | Category landing pages ✗ | Filterable grid ✗ → one index, sections per category.

## Specs format
- Key/value rows ✓ | Rich text ✗ → repeatable {label,value} localized rows → spec table.

## Claude's Discretion
- Field names/slugs, route paths, ProductCard reuse, anchor-nav vs sections, gallery interaction (no lightbox), spec-table styling.

## Deferred
- Per-product RFQ form (Phase 4), Product JSON-LD/sitemap (Phase 5), nested categories/faceted search (post-v1), analytics (Phase 4).
