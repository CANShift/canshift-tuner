# Tuner tokens

The app's colour vocabulary, and the authority for it: this page maps each token name to the name the
code uses. The values come from the [redesign handoff](../redesign/HANDOFF.md#4-design-tokens).

## Design language

Dark, calm and phone-first. Cards and sheets on a near-black ground, rounded controls, plain language.
The **system font stack** speaks (labels, buttons, titles) and the **system monospace** measures (live
values, versions). Nothing is downloaded: the tuner is served by the dash and runs offline. Everything
outside the dash preview follows this page; the preview follows [the dash design system](DASH_DESIGN_SYSTEM.md)
and keeps the dash's own fonts.

Defined in [`src/styles/ui-tokens.css`](../../src/styles/ui-tokens.css), exposed to Tailwind as the `app`
colour family in `tailwind.config.ts`. The `app` family is the only app colour family: there is no
other set of app colours to reach for. Never hard-code these values in a component.

## Colours

The tuner is dark only: one value per token, on `:root`. Day and night belong to the dash's own
themes, previewed on the canvas, not to the app.

| CSS variable        | Tailwind          | Value     | Use                                                          |
| ------------------- | ----------------- | --------- | ------------------------------------------------------------ |
| `--app-bg`          | `app-bg`          | `#0e0f11` | app background, inputs                                       |
| `--app-surface`     | `app-surface`     | `#16181b` | cards, sheets, header, tab bar                               |
| `--app-surface-2`   | `app-surface-2`   | `#1e2125` | secondary buttons, active nav item                           |
| `--app-border`      | `app-border`      | `#2b2f35` | borders                                                      |
| `--app-divider`     | `app-divider`     | `#23262b` | divider rows inside a card                                   |
| `--app-text`        | `app-text`        | `#f2f3f5` | primary text, the selected segment fill (with `app-bg` text) |
| `--app-secondary`   | `app-secondary`   | `#c9cdd2` | secondary body text                                          |
| `--app-muted`       | `app-muted`       | `#a0a6ad` | captions                                                     |
| `--app-accent`      | `app-accent`      | `#ff4747` | dash red: icons, active tab icon, accents on dark            |
| `--app-primary`     | `app-primary`     | `#d63333` | filled red buttons with white text (≥ 4.5:1)                 |
| `--app-warning`     | `app-warning`     | `#ff8800` | warning limits, the unsent dot, reconnecting                 |
| `--app-warning-bg`  | `app-warning-bg`  | `#2a1c0a` | warning banner ground                                        |
| `--app-warning-ink` | `app-warning-ink` | `#ffc27a` | text on the warning ground                                   |
| `--app-success`     | `app-success`     | `#3dd68c` | connected, live, success                                     |
| `--app-success-bg`  | `app-success-bg`  | `#123826` | success ground                                               |

## Type, radius, size

| Token            | Tailwind                          | Value                                                      |
| ---------------- | --------------------------------- | ---------------------------------------------------------- |
| `--app-font`     | `font-ui` (also the body default) | `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` |
| `--app-font-num` | `font-num`                        | `ui-monospace, "SF Mono", Menlo, Consolas, monospace`      |
| control radius   | `rounded-control`                 | 10 px — buttons, inputs, segmented controls                |
| card radius      | `rounded-card`                    | 14 px — cards                                              |
| sheet radius     | `rounded-sheet`                   | 16 px — sheets and dialogs                                 |
| safe area        | `pb-safe-bottom`                  | `env(safe-area-inset-bottom)`, under the phone tab bar     |

Controls are 44–52 px high, list rows 48–52 px, the phone header 56 px and the tab bar 84 px including
the safe area. Every touch target is at least 44 px.

## Relation to `@canshift/core`

Core owns the dash's tokens and the brand mark, and publishes them through
`scripts/generate-tokens.css.ts` into `src/styles/tokens.generated.css`. That file stays: the canvas
preview renders the dash and reads only the dash's tokens and fonts (`font-sans` is the dash's
Archivo, `font-mono` its JetBrains Mono), never the app's. Restyling the app can never move the
preview.

The `app` family above is the app's chrome, which core has no consumer for.

## Rules

- `src/index.css` zeroes `border-radius` on `*`; a radius is always a deliberate `rounded-*` class.
- Focus is `outline: 2px solid var(--app-accent)` with a 2 px offset, on every interactive element. The
  browser default ring is never acceptable.
- Two safety cues never look alike: a gauge limit is an **outlined** orange or red swatch, the
  full-screen alert is a **solid** `app-primary` block with the full-screen corners icon.
