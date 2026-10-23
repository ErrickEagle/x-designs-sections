# Strata — marketing site

The landing page for Strata: templates and sections built with AI, each one
shipped with the Claude prompt that made it.

Plain HTML plus Tailwind CSS. `dist/tw.css` is committed, so `index.html` opens
as-is — no build needed just to look at it.

## Sections, top to bottom

1. **Hero** — rotating "You don't need…" line, two-line headline over a blurred wall of template screens, Browse / Learn more, payments line
2. **Featured templates** — 3 × 3 grid of cards with live page previews
3. **How it works** — three steps: choose, prompt into your brand, publish
4. **Works with** — two-row logo slider of the tools the templates work in
5. **Why Strata** — five-card bento (text only for now; visuals to come)
6. **Your options, side by side** — Strata vs hiring a designer or agency
7. **Notes from people who shipped** — testimonials (placeholders, see below)
8. **Pricing** — Single Template License and ALL Access
9. **FAQ** — one question open at a time
10. **CTA** — glass card over a dusk horizon
11. **Footer**

## Preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Editing styles

Classes are Tailwind. After changing classes in `index.html`, rebuild the CSS:

```bash
npm install
npm run build      # one-off
npm run dev        # rebuilds on every save
```

Brand colours and the font live in `tailwind.config.js` (`night`, `bone`, `volt`;
Plus Jakarta Sans). The shared 1380px container is `.shell` in `input.css` —
every section uses it, so their left and right edges line up.

## 3D sections

`three` is installed for 3D sections. Scene code lives in `src/`;
`src/stage.js` has `mountStage()`, which every scene uses for the renderer,
resizing, pausing while off-screen and a still frame under reduced motion.

```bash
npm run build:js   # bundles src/main.js to dist/main.js
npm run dev:js     # rebuilds on every save
npm run build      # CSS and JS together
```

No scene is on the page yet. When the first one lands, commit `dist/main.js`
like `dist/tw.css` so the page still opens without a build, and load it with
`<script type="module" src="dist/main.js">`.

## Placeholders to replace before launch

These are stand-ins, not real data:

- **Prices** — $129 and $299 are Templifica's, used as placeholders.
- **Policies** — "single website license", "unlimited websites", "lifetime
  updates", "priority support", "no time limit". These appear in the pricing
  cards, the comparison table *and* the FAQ; change all three together.
- **Testimonials** — the two review cards are marked *Placeholder*.
- **Agency ranges** — "$2,500 to $25,000" and "4 to 16 weeks" are Templifica's
  ballpark figures.
- **Templates** — the nine template names and previews are invented; swap in
  screenshots of your real ones.
- **Contact** — `hello@strata.studio` is invented; social links point nowhere.
- **Ask an AI** tiles open real searches, but those engines won't know Strata
  until the site is live and indexed.

## Logos

Brand marks are inlined as an SVG sprite at the top of `index.html`, taken from
official sources rather than redrawn: Lobe Icons (Claude, Codex, Antigravity,
Cursor, and the other AI tools), Simple Icons (Framer, Webflow, Vercel and the
rest), the Iconify logo set (Stripe wordmark, LinkedIn) and Polar's own checkout
package (Polar). Each mark belongs to its company.
