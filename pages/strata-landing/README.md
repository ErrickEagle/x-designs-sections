# Strata — landing page

Single-page marketing site for Strata, a marketplace of AI-ready website
templates and sections.

`index.html` is self-contained: Tailwind is already compiled into an inline
`<style>` block and the only external request is the Plus Jakarta Sans
webfont. No build step, no dependencies — open the file in a browser, or
drop it on any static host.

## Sections

1. Nav + hero with trust/payment cards
2. Logo stripe slider
3. "From ideas to live site in a few prompts" — three steps
4. "The smart way to build your website is with AI" — five-card bento
5. Pricing
6. CTA
7. Footer

Layout is capped at 1380px via the `.shell` wrapper, so every section lines
up on the same left and right edges.

## Deploying

Any static host works. On Vercel: import the repo and deploy with no build
command and the repository root as the output directory.

## How this relates to the section library

This is a whole page, not a section, so the rules in `CLAUDE.md` for
`sections/` don't apply to it: the markup carries compiled Tailwind utility
classes instead of `--xd-*` tokens, there are no `XD:START` / `XD:END`
markers, and it links the Plus Jakarta Sans webfont. It lives here as a
finished reference build. Anything worth reusing should be lifted out into
`sections/<name>/` and rewritten against the tokens.
