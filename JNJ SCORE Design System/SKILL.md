---
name: jnj-score-design
description: Use this skill to generate well-branded interfaces and assets for JNJ SCORE, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. JNJ SCORE is a sports scoring & athletic performance brand built on a Nike-inspired monochromatic, type-driven design language.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always link `colors_and_type.css` so design tokens are available, and pull components / patterns from `ui_kits/web/` as your starting point.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Critical brand rules
- UI is monochromatic — black `#111111`, white `#FFFFFF`, grey scale only. Color comes from photography/product, never from interface chrome.
- Display headlines are uppercase Oswald (Nike Futura ND substitute) at 96px / line-height 0.90.
- Body type is Helvetica Neue stack, weight 500 for interactive text.
- Buttons are pill-shaped (30px radius). Primary = black bg / white text.
- Photography is full-bleed, edge-to-edge, no border radius.
- No card shadows. No hover lifts. Flat elevation model.
- No emoji. No exclamation marks in copy. Verbs first.
