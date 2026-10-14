# Design System Master File: Vibrant Mart (Web)

> **LOGIC:** When building a specific page, first check `design-system/web/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Vibrant Mart (E-Commerce Luxury & Editorial Skincare)  
**Framework:** React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4 + Framer Motion  
**Standard:** UI/UX Pro Max System  

---

## 1. Brand Identity & Design Direction

- **Brand Spirit:** Warm Luxury, Editorial Beauty, Mindful Skincare.
- **Visual Aesthetic:** Liquid Glass meets Editorial Warmth — subtle translucent glassmorphism (`backdrop-blur-md`), warm cashmere borders, micro-interactions without layout shifts, generous breathing space.
- **Typography Tone:** Editorial Serif for expressive headlines (`Playfair Display` / `Cormorant`) paired with hyper-legible Geometric/Neo-grotesque Sans (`Plus Jakarta Sans` / `Montserrat`) for body copy and pricing.

---

## 2. Global Color System & Design Tokens

| Role | Token Name | Hex Value | Semantic Usage |
|------|------------|-----------|----------------|
| **Primary / Deep Ink** | `--color-primary` | `#1C1917` | Headers, primary buttons, logo mark |
| **On Primary** | `--color-on-primary` | `#FFFFFF` | Text on primary dark backgrounds |
| **Secondary / Warm Stone** | `--color-secondary` | `#44403C` | Subheadings, navigation items |
| **Accent / Artisan Gold** | `--color-accent` | `#A16207` | Key CTAs, badges, highlight accents |
| **Accent Hover** | `--color-accent-hover` | `#854D0E` | Active and hover states for gold accents |
| **Background / Warm Cream** | `--color-background` | `#FAF7F2` | Page background, natural warm paper tone |
| **Surface / Card** | `--color-card` | `#FFFFFF` | Product cards, dialogs, form sheets |
| **Surface Muted / Sand** | `--color-muted` | `#F5EFE6` | Secondary panels, skeleton placeholders |
| **Border Soft** | `--color-border` | `#E7E0D8` | Dividers, card boundaries (subtle cashmere) |
| **Border Strong** | `--color-border-strong` | `#D6C8B8` | Focused states, input borders on hover |
| **Text Primary** | `--color-text-primary` | `#1C1917` | Main headings & key numbers (contrast > 12:1) |
| **Text Secondary** | `--color-text-secondary` | `#594D42` | Body copy, descriptions (contrast > 6.5:1) |
| **Text Muted** | `--color-text-muted` | `#786C60` | Footers, captions, timestamps (contrast >= 4.5:1) |
| **Price / Highlight** | `--color-price` | `#B45309` | Product pricing & key conversion numbers |
| **Success / Mint** | `--color-success` | `#15803D` | In-stock badges, order success states |
| **Destructive / Rose** | `--color-destructive` | `#DC2626` | Error alerts, out of stock, delete actions |

---

## 3. Typography Scale & Pairings

- **Heading Display:** `'Playfair Display', Cormorant, Georgia, serif`
  - Hero `H1`: `font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15]`
  - Section `H2`: `font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight leading-snug`
  - Card/Modal `H3`: `font-display font-bold text-lg sm:text-xl text-[#1C1917]`
- **Body & UI Sans:** `'Plus Jakarta Sans', Montserrat, system-ui, -apple-system, sans-serif`
  - Body Normal: `text-sm leading-relaxed text-[#594D42]`
  - Eyebrows / Chips: `text-[11px] font-bold uppercase tracking-[0.18em]`
  - Price: `font-extrabold text-[#B45309] tracking-tight`

---

## 4. Spacing, Rhythm & Elevation

| Scale Token | Value | Applied To |
|-------------|-------|------------|
| `space-xs` | `4px` (`0.25rem`) | Micro gaps, icon label spacing |
| `space-sm` | `8px` (`0.5rem`) | Chip padding, list spacing |
| `space-md` | `16px` (`1rem`) | Component internal padding, input height padding |
| `space-lg` | `24px` (`1.5rem`) | Card padding, grid gap on mobile |
| `space-xl` | `32px` (`2rem`) | Section padding on mobile, modal inset |
| `space-2xl` | `48px` (`3rem`) | Desktop section spacing |
| `space-3xl` | `64px` (`4rem`) | Hero vertical spacing |

### Elevation & Shadows
- `--shadow-soft`: `0 8px 30px rgba(43, 33, 24, 0.05)`
- `--shadow-lift`: `0 16px 40px rgba(43, 33, 24, 0.09)`
- `--shadow-glass`: `0 10px 30px rgba(43, 33, 24, 0.07)`

---

## 5. UI/UX Pro Max Rules & Accessibility Checklist

1. **Vector-Only Icons:** Use Lucide SVG icons exclusively. **NO emoji used as icons**.
2. **Touch Targets & Hit Areas:** All buttons, links, and icon controls have a touch target >= 44x44px.
3. **Interactive Lift Without Layout Jitter:** Hover elevation uses `translateY(-3px)` with smooth cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`), avoiding layout shift.
4. **Accessible Forms:** All inputs must have associated labels, clear focus rings (`focus:ring-4 focus:ring-[#A16207]/15`), and accessible error messages (`aria-invalid`, `aria-describedby`).
5. **Reduced Motion:** Honor `prefers-reduced-motion: reduce` by disabling aggressive translation or continuous auto-rotation.
6. **Responsive Layouts:** Flawlessly adapted across 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide screen).
