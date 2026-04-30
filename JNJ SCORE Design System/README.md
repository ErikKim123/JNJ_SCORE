# JNJ SCORE Design System

A kinetic, monochromatic design system inspired by Nike's "Podium CDS" — built for **JNJ SCORE**, a sports scoring & athletic performance platform.

The system channels the explosive energy of sport into a digital surface: strip everything back to black, white, and grey so that athletic photography, live data, and product color can dominate without competition. Every pixel either sells the moment or drives toward the next action.

---

## Brand Context

**JNJ SCORE** is a sports performance & live scoring platform. Athletes, coaches, and fans use it to follow games, log workouts, track gear, and shop performance product. The brand voice is direct, confident, and physical — language reads like a coach, not a copywriter.

This design system was authored from the Nike-inspired brief. There is no external Figma or codebase — all visual decisions trace back to the written brief, applied to a JNJ SCORE context.

---

## Sources

- **Brief:** Nike-inspired design system spec (provided in chat)
- **Codebase:** None attached
- **Figma:** None attached
- **Decks:** None attached

If/when production sources arrive, they should be attached via the Import menu and this README updated to reference them.

---

## Content Fundamentals

JNJ SCORE copy is **physical, declarative, and uppercase-loud at the headline level**. It treats the reader like an athlete being briefed before the whistle.

**Voice & tone**
- Direct second-person ("you", "your") in body. No "we" hedging in headlines.
- Verbs first. "Track every rep." "Win the morning." "Crush the split."
- Confident, never hyped. No exclamation marks. The all-caps display type carries the volume.
- Functional clarity in body — Swiss-precision specs, prices, stats, times. No marketing bloat under headlines.

**Casing**
- **HEADLINES: ALL CAPS** — Nike Futura ND, 96px, line-height 0.90.
- Section titles & product titles: Sentence case, weight 500.
- Body & nav: Sentence case.
- Labels, badges, status: ALL CAPS, 12–14px, tight letter-spacing.

**Examples**
- Hero: **"DON'T STOP. NEVER SETTLE."** — body: "Track every workout, every game, every rep. JNJ SCORE keeps the receipts."
- Product card: "Velocity Cleat 7" — "Carbon plate. Game day."
- Empty state: "No games yet. Log one." — never "It looks like you don't have any games yet…"
- Error: "Couldn't load. Try again." — never "Oops!" or "Something went wrong."

**No-go**
- No emoji in UI. Ever.
- No exclamation marks in UI strings.
- No corporate softening ("we're excited to", "please", "kindly").
- No marketing adjectives stacked ("revolutionary, game-changing"). One verb beats three adjectives.

---

## Visual Foundations

**Color philosophy.** Monochromatic UI. Black (`#111111`), white (`#FFFFFF`), and a precise grey scale carry the entire interface. Color is reserved for:
1. **Semantic meaning** — red for error/sale, green for success, blue for links.
2. **Photography & product** — the merch and the athletes are the color story.
3. **Live data accents** — orange flash (`#FF5000`) for in-progress / live state.

**Type.** Two families. **Nike Futura ND** (display) for massive uppercase headlines at 96px / line-height 0.90 — substituted with **Oswald** from Google Fonts (closest condensed match available). **Helvetica Now** (text) for everything else — substituted with **Helvetica Neue / Helvetica / Arial** system stack. Weight 500 dominates interactive text; weight 400 only for long-form body and legal.

> **⚠ Font substitution flag:** We do not have Nike Futura ND or Helvetica Now licensed font files. Display uses **Oswald 500** (Google Fonts) — closest condensed-Futura match available without licensing. Body uses the system **Helvetica Neue → Helvetica → Arial** stack. Please supply licensed font files (`.woff2`/`.ttf`) to drop into `fonts/` if pixel-fidelity is required.

**Backgrounds.** Almost always white (`#FFFFFF`) or near-white (`#FAFAFA`). Hero sections use **full-bleed photography** — edge-to-edge, no border radius, with a dark gradient scrim for text legibility. Inverted sections use Deep Charcoal (`#1F1F21`) or Dark Surface (`#28282A`). No repeating textures, no patterns, no hand-drawn illustration. The image IS the background.

**Imagery vibe.** High-contrast athletic photography — sweat, motion blur, stadium lighting. Cool-leaning whites, deep neutral shadows. Not warm, not graded toward orange. Product shots on flat color or subtle photographic gradients (e.g. red shoe on red→deep-red background).

**Animation.** Restrained, athletic. 200ms ease for color/opacity transitions. No bounces, no springs, no parallax. Image swaps on product hover (front → side view) at 200ms ease. The only "kinetic" element is the imagery itself — UI doesn't move.

**Hover states.**
- Text links: color shifts from `#111111` → `#707072` (lighter grey).
- Primary buttons: `#111111` → `#707072` background.
- Outlined buttons: border `#CACACB` → `#707072`, fill → `#E5E5E5`.
- Product cards: secondary image cross-fades at 200ms. **No lift, no shadow, no scale.**

**Press / active states.** Buttons get a scale(0) ripple effect at 50% opacity — a brief tactile pulse, no transform. No shrink, no color flip.

**Borders.** 1px solid `#CACACB` for inputs and dividers. 1.5px solid for outlined buttons. Active border: `#111111`. Error border: `#D30005`.

**Shadows.** **None on cards. None on hover. None on elevation.** The only "shadow" is a 1px inset divider (`0px -1px 0px 0px #E5E5E5 inset`) and the focus ring (`0 0 0 2px rgba(39, 93, 197, 1)`).

**Layout rules.**
- 8px spacing grid. Every measurement snaps.
- Max content 1440px, max canvas 1920px.
- Product grids run **tight** (4–12px gaps) — abundance feel.
- Section breaks run **generous** (48–80px).
- Sticky white nav at top (~60px). Optional dark promo banner above (~32px).

**Transparency & blur.** Used sparingly. Dark photographic scrims at ~40% opacity for text-on-image. No backdrop-filter blur in primary UI — only on full-screen mobile menu overlays.

**Corner radii.**
- 0px on all photography & product imagery.
- 8px form inputs.
- 20px UI containers.
- 24px search input pill.
- **30px buttons & filters** (the signature pill).
- 50% circular icon buttons.

**Cards.** White surface, no border, no shadow, no radius on the image, 12px gap between image and metadata text. Hover swaps the image — that's it.

---

## Iconography

JNJ SCORE uses **Lucide** icons (loaded from CDN) as the working icon system — clean, geometric, single-stroke at 1.5px, matching the athletic-monochrome aesthetic. Icons render in `#111111` at 20–24px, never colored except for inheriting semantic color (red on errors, green on success).

> **⚠ Icon substitution flag:** With no codebase or Figma attached, there's no first-party icon set to copy. **Lucide** is the substitute (CDN-linked) — closest match for Nike's actual icon style (geometric, single-weight stroke, slightly rounded terminals). If a proprietary icon set exists, drop SVGs into `assets/icons/` and update components.

**Rules**
- Single stroke, 1.5–2px weight. No filled icons in the UI.
- Always inherit `currentColor`.
- 24×24px in nav and CTAs; 20×20px inline with body text; 16×16px in chips.
- **Never use emoji.**
- **Never use unicode glyphs as decorative icons** (✓ ★ → etc). Use Lucide.

The **JNJ SCORE wordmark** lives in `assets/logo.svg` — a custom condensed wordmark in the Nike Futura spirit. The **monogram** (`assets/monogram.svg`) is the favicon-scale lockup.

---

## Index

Root files:
- `README.md` — this document
- `SKILL.md` — Claude Skill manifest (cross-compatible with Agent Skills)
- `colors_and_type.css` — CSS custom properties for color, type, spacing, radii, shadows
- `fonts/` — local font files (currently empty; Oswald loaded via Google Fonts)
- `assets/` — logos, monograms, sample athlete imagery
- `preview/` — design system cards (rendered in the Design System tab)
- `ui_kits/web/` — JNJ SCORE web product UI kit (interactive click-thru)

UI kits:
- **`ui_kits/web/`** — marketing + scoring web surface. Includes `index.html` (interactive), and JSX components for nav, hero, scoreboard, product grid, buttons, inputs.
