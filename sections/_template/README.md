# Section Name

> Copy this folder to `sections/<your-section-name>/` and replace everything
> between the `XD:START` / `XD:END` markers in `index.html`.

**What it is.** One or two sentences: what the section does on a page and when
to reach for it.

**Where it fits.** e.g. directly under the nav, as the first thing on a landing
page.

## Variants
- `default` — the version in `index.html`.

## Tokens used
`--xd-bg`, `--xd-ink`, `--xd-ink-soft`, `--xd-font`, `--xd-font-display`,
`--xd-pad-section`, `--xd-gutter`, `--xd-max`

## Assets
None. (If the section needs images or SVGs, put them in this folder's
`assets/` and reference them relatively.)

## Checklist before committing
- [ ] Every CSS selector is prefixed with the section's own class
- [ ] Reads correctly at 360px wide with no horizontal scroll
- [ ] Works in light and dark (toggle with `data-theme` on `<html>`)
- [ ] Colors come from tokens, not hex literals
- [ ] A card for it was added to the root `index.html` gallery
