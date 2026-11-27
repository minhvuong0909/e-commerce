# Design System Master — Vibrant Mart "Vibrant Glow" (Web)

> When building a page, check `design-system/web/pages/[page].md` first; its rules override this file.
> Tokens live in `apps/web/tailwind.config.js` and `apps/web/src/index.css`. Use token classes, never raw hex.

**Stack:** React 19 · TypeScript · Vite 7 · Tailwind 3.4 · Framer Motion · lucide-react
**Direction (ui-ux-pro-max):** Soft UI Evolution + bento layout. Beauty/skincare e-commerce, variance 7 · motion 6 · density 5.

## 1. Brand

- Playful-premium, confident, honest. Big expressive display type, soft colour tiles, a deep aubergine anchor.
- Wordmark: `BrandMark` component (`V` monogram tile + lime dot + `vibrant.mart`).
- No invented claims: no fake partner logos, fake review counts, unconfigured free-shipping or "SSL 256-bit" badges.

## 2. Colour tokens

| Role | Token | Hex | Use |
|---|---|---|---|
| Canvas | `bg-canvas` | `#FFFAF7` | Page background |
| Ink (anchor) | `ink-950` | `#1B0F1F` | Text, primary buttons, dark panels, footer |
| Ink muted | `ink-600` / `ink-500` | `#5C4D62` / `#76667C` | Body copy / captions (≥4.5:1 on canvas) |
| Lines | `ink-100` / `ink-200` | `#F3EEF4` / `#E6DDE8` | Rings, dividers, input borders |
| Primary | `berry-600` | `#C21C63` | CTAs (`variant='accent'`), links, focus ring |
| Primary on dark | `berry-500` / `berry-300` | `#E0307A` / `#FF94BD` | CTA on ink panels, accents on dark |
| Tiles | `berry-50/100`, `lilac-50/100`, `peach-100/200`, `lime-200/300` | — | Product-card tints, bento tiles, category tiles |
| Pop | `lime-300` | `#D4F25A` | "Mới" badge, done states, highlights on ink (always with ink text) |

`brand-*` is a legacy alias of `berry-*`.

## 3. Typography

- Display: **Bricolage Grotesque** 500–800 (`font-display`, tight tracking, `text-wrap: balance`).
- Body/UI: **Be Vietnam Pro** 400–800 (full Vietnamese diacritics).
- Scale: hero `text-[2.75rem] → lg:text-[5.25rem]`, section `text-3xl → md:text-[2.75rem]`, page title `text-4xl → md:text-5xl`, body `15px`.
- Eyebrow: `.eyebrow` (12px, 0.14em tracking, berry dot).

## 4. Shape, elevation, motion

- Radius: inputs `xl`, small cards `3xl`, sections/panels `4xl` (2.25rem), buttons/chips `full`.
- Surfaces are flat white with `ring-1 ring-ink-100`; shadows only on overlays (`shadow-lift`) and CTAs (`shadow-glow`).
- Motion: 200–300ms ease-out; stagger grid reveal (`staggerContainer`/`fadeUpItem`); ticker `animate-marquee`; all disabled under `prefers-reduced-motion`.

## 5. Components

- `Button` — variants `primary | accent | secondary | outline | ghost | danger | gradient`, sizes `sm | md | lg`, pill shape.
- `Input` / `.field` / `.field-label` — 48px, 1.5px border, berry focus halo.
- `ProductCard` — tinted 4:5 image tile (`tint` cycles via `CARD_TINTS`), badges top-left, wishlist top-right, hover actions (always visible on touch).
- `StatusBadge`, `EmptyState`, `SectionHeader`, `PaginationBar` (numbered), `QuickViewModal` (bottom-sheet on mobile, Esc to close).

## 6. Layout

- Container `max-w-[1320px]`, gutters `px-4 md:px-6`.
- Storefront: marquee ticker → sticky glass header (search with `/` shortcut + live suggestions) → category rail (real categories) → content → ink footer. Mobile: floating pill dock.
- Home: bento hero (live best-seller) → category tiles → best-seller rail → 4-step routine → shop grid (search/category/sort in URL, `#shop`) → promises → join band.
- Admin: ink sidebar + light workspace (`.admin-theme`), same tokens, denser.

## 7. Pre-delivery checklist

- [ ] Token classes only — no raw hex (exception: third-party brand colours e.g. MoMo `#A50064`).
- [ ] Every icon-only control has `aria-label`; decorative icons `aria-hidden`.
- [ ] Touch targets ≥ 40px; focus visible (berry ring).
- [ ] Check 390 / 768 / 1440px.
- [ ] Copy states only what the backend actually supports.
