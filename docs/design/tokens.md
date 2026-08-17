# Tuner tokens

The app's colour vocabulary. `PROMPT_TUNER_APP.md` §1 is the authority; this page is the map from the
name the spec uses to the name the code uses.

Defined in [`src/styles/ui-tokens.css`](../../src/styles/ui-tokens.css), exposed to Tailwind as the `ui`
colour family in `tailwind.config.ts`. Never hard-code these values in a component.

## Themed

Dark is the default on `:root`; light overrides on `:root[data-theme='light']`.

| Spec           | CSS variable       | Tailwind         | Light                 | Dark                     | Use                                |
| -------------- | ------------------ | ---------------- | --------------------- | ------------------------ | ---------------------------------- |
| `--t-bg`       | `--ui-bg`          | `ui-bg`          | `#f3f2f2`             | `#17161a`                | page ground                        |
| `--t-panel`    | `--ui-panel`       | `ui-panel`       | `#eae9e9`             | `#201f24`                | hover, inset panels, canvas ground |
| `--t-ink`      | `--ui-ink`         | `ui-ink`         | `#201e1d`             | `#f3f2f2`                | text, borders, 2 px rules          |
| `--t-muted`    | `--ui-muted`       | `ui-muted`       | `#605d5d`             | `#a09da3`                | labels, secondary text             |
| `--t-faint`    | `--ui-faint`       | `ui-faint`       | `#8a8785`             | `#7a777d`                | tertiary, disabled text            |
| `--t-line`     | `--ui-line`        | `ui-line`        | `rgb(32 30 29 / .16)` | `rgb(243 242 242 / .16)` | 1 px separators                    |
| `--t-line2`    | `--ui-line-strong` | `ui-line-strong` | `rgb(32 30 29 / .3)`  | `rgb(243 242 242 / .32)` | input borders                      |
| `--t-rule`     | `--ui-rule`        | `ui-rule`        | `#201e1d`             | `#f3f2f2`                | 2 px rules                         |
| `--t-hdr-bg`   | `--ui-header-bg`   | `ui-header-bg`   | `#201e1d`             | `#0d0d0f`                | header + footer ground             |
| `--t-hdr-ink`  | `--ui-header-ink`  | `ui-header-ink`  | `#f3f2f2`             | `#f3f2f2`                | header text                        |
| `--t-hdr-dim`  | `--ui-header-dim`  | `ui-header-dim`  | `#b9b6b4`             | `#86838a`                | header idle text                   |
| `--t-hdr-line` | `--ui-header-line` | `ui-header-line` | `#3a3736`             | `#2b2a30`                | header separators                  |

## Fixed

Identical in both themes. There is no thirteenth colour.

| CSS variable        | Tailwind          | Value     | Use                                              |
| ------------------- | ----------------- | --------- | ------------------------------------------------ |
| `--ui-accent`       | `ui-accent`       | `#ec3013` | primary action, active tab, current-page outline |
| `--ui-accent-hover` | `ui-accent-hover` | `#c62810` | hover on a primary action                        |
| `--ui-warning`      | `ui-warning`      | `#ff8800` | out of range, keep driving; `DO NOT UNPLUG`      |
| `--ui-danger`       | `ui-danger`       | `#ff4444` | danger or failure                                |
| `--ui-engaged`      | `ui-engaged`      | `#ff4747` | this function is on — dash buttons only          |
| `--ui-ok`           | `ui-ok`           | `#00cc2a` | connected, success                               |
| `--ui-console`      | `ui-console`      | `#0d0d0d` | CLI ground, in both themes                       |
| `--ui-console-ink`  | `ui-console-ink`  | `#e8e6e3` | CLI text                                         |

## Relation to `@canshift/core`

Core owns the dash's tokens and the brand mark, and publishes them through
`scripts/generate-tokens.css.ts` into `src/styles/tokens.generated.css`. That file stays: the canvas
preview renders the dash and must read the dash's tokens, not the app's.

The `ui` family above is the app's chrome, which core has no consumer for. Where the two agree they agree
by value, not by reference — `--ui-accent` and core's `--brand-accent` are both `#ec3013`.

## Rules

- Radius 0 and no shadow. `src/index.css` zeroes `border-radius` on `*`, which catches the browser
  defaults on `input` and `button`; a `rounded-*` utility still wins on specificity, so a deliberate
  radius has to be typed and will be caught in review.
- Focus is `outline: 2px solid var(--ui-accent)` with a 2 px offset, on every interactive element. The
  browser default ring is never acceptable.
- Opacity below 100 % is for the canvas carousel's inactive pages, nothing else.
