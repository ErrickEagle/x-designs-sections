# X Designs

A private library of reusable website sections — heroes, feature grids,
pricing tables, FAQs, footers and whatever else gets built — for use across
marketplace and product sites.

Every section is self-contained HTML + CSS with no build step and no
dependencies. Open a preview file in a browser and it works.

## Layout

```
index.html          Gallery — links to every section's preview
tokens/tokens.css   Shared design tokens (color, type, shape, rhythm)
sections/
  _template/        Copy this to start a new section
  hero-split/       index.html (preview) + README.md (+ optional assets/)
assets/             Shared images/SVGs used by more than one section
```

## Using a section

1. Open `index.html` and click through to the section you want.
2. In that section's `index.html`, copy everything between
   `<!-- XD:START ... -->` and `<!-- XD:END ... -->` — that's the `<style>`
   block plus the markup.
3. Paste it into your page.
4. Make sure the host page defines the `--xd-*` tokens: either link
   `tokens/tokens.css`, or copy the `:root` block out of it and adjust the
   values to match the site.

Selectors inside a section are all prefixed with that section's own class, so
nothing leaks into or collides with the host site's CSS.

## Adding a section

```bash
cp -r sections/_template sections/my-section
```

Then rename the class prefix, build the thing, fill in the README, and add a
card to the gallery in `index.html`. `CLAUDE.md` has the full conventions.

## Previewing locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening the files directly with `file://` also works.

## Theming

Tokens respond to the OS light/dark setting. To pin a theme while working, set
`data-theme="light"` or `data-theme="dark"` on `<html>`.
