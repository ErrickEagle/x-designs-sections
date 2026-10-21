# Conventions for this repo

> **`site/` is a separate project** — the Strata marketing site, built with
> Tailwind (it has a build step and a `package.json`). The section-library rules
> below don't apply to it; see `site/README.md`.

X Designs is a library of standalone website sections. No build step, no
package manager, no framework — plain HTML and CSS that runs from the
filesystem.

## Structure

- `tokens/tokens.css` — the single source of truth for color, type, shape and
  rhythm. Sections read from it; they don't redefine it.
- `sections/<name>/index.html` — a standalone preview page for one section.
- `sections/<name>/README.md` — what it is, where it fits, variants, tokens
  used, assets needed.
- `sections/<name>/assets/` — images/SVGs used only by that section.
- `assets/` — images/SVGs shared by more than one section.
- `index.html` — the gallery. Hand-maintained; add a card per section.

## Section rules

1. **Markers.** The section lives between
   `<!-- XD:START section=<name> -->` and `<!-- XD:END section=<name> -->`,
   and includes its own `<style>` block. Everything outside the markers is
   preview chrome and is not part of the deliverable.
2. **Prefix every selector** with the section's own class, `.xd-<name>`. No
   bare element or utility selectors inside the markers — the block has to
   survive being pasted into a page with its own CSS.
3. **Colors, type and spacing come from `--xd-*` tokens**, not hex literals or
   magic pixel values. If a section genuinely needs a new token, add it to
   `tokens/tokens.css` with a sensible dark-mode value rather than hardcoding.
4. **Light and dark both work.** Tokens handle it; check the section against
   `data-theme="dark"` on `<html>` before committing.
5. **Responsive down to 360px** with no horizontal scroll. Collapse multi-column
   layouts with a media query inside the section's own style block.
6. **Accessible.** Real heading levels, `aria-labelledby` on the `<section>`,
   `alt` text on images, decorative elements marked `aria-hidden="true"`,
   and motion wrapped in `@media (prefers-reduced-motion: reduce)`.
7. **No external dependencies.** No CDN scripts, no webfont links inside a
   section. Fonts come from the token stack, which degrades to system fonts.
8. **Self-contained assets.** Reference section-local assets relatively
   (`assets/thing.svg`), never with an absolute path.

## When adding a section

- Start from `sections/_template/`.
- Fill in the README — especially "where it fits" and the token list.
- Add a card to the `.grid` in the root `index.html` and update the section
  count above it.
- Keep placeholder copy honest: write real-sounding example text, never
  lorem ipsum, and never a specific claim (a price, a customer count, a
  testimonial) that someone might ship by accident.

## Naming

Section folders are lowercase kebab-case and describe the shape, not the
content: `hero-split`, `feature-grid-3up`, `pricing-tiers`, `faq-accordion`,
`footer-tall`. Numbered variants of the same shape get a suffix:
`hero-split`, `hero-split-centered`.
