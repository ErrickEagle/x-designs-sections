# Hero Split

**What it is.** A two-column hero: copy and calls-to-action on the left, a
framed panel on the right for a product screenshot or mock. Collapses to a
single column under 900px.

**Where it fits.** First section on a landing page, directly under the nav.

## Variants
- `default` — empty panel with an accent wash, ready for an image.

## Tokens used
`--xd-bg`, `--xd-surface`, `--xd-ink`, `--xd-ink-soft`, `--xd-line`,
`--xd-accent`, `--xd-accent-ink`, `--xd-ok`, `--xd-radius`, `--xd-shadow`,
`--xd-ease`, `--xd-font`, `--xd-font-display`, `--xd-pad-section`,
`--xd-gutter`, `--xd-max`

## Assets
None by default. Drop a screenshot in `assets/` and point the commented-out
`<img>` inside `.xd-panel` at it.

## Notes
- The eyebrow pill is optional — delete the `<p class="xd-eyebrow">` line if
  there's nothing true to put in it.
- `color-mix()` is used for the accent wash and the dot halo; it needs a 2023+
  browser. Replace with an `rgba()` literal if you need older support.
