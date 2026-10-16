# Tuner tokens

The app's colour vocabulary, and the authority for it: this page maps each token name to the name the
code uses. The values come from the [redesign handoff](../redesign/HANDOFF.md#4-design-tokens).

## Design language

Dark, calm and phone-first. Cards and sheets on a near-black ground, rounded controls, plain language.
The **system font stack** speaks (labels, buttons, titles) and the **system monospace** measures (live
values, versions). Nothing is downloaded: the tuner is served by the dash and runs offline. Everything
outside the dash preview follows this page; the preview follows [the dash design system](DASH_DESIGN_SYSTEM.md)
and keeps the dash's own fonts.

Defined in [`src/styles/ui-tokens.css`](../../src/styles/ui-tokens.css), exposed to Tailwind as the `ui`
colour family in `tailwind.config.ts`. Never hard-code these values in a component.

## Colours

The tuner is dark only: one value per token, on `:root`. Day and night belong to the dash's own
themes, previewed on the canvas, not to the app.

| CSS variable       | Tailwind         | Value     | Use                                                         |
| ------------------ | ---------------- | --------- | ----------------------------------------------------------- |
| `--ui-bg`          | `ui-bg`          | `#0e0f11` | app background, inputs                                      |
| `--ui-surface`     | `ui-surface`     | `#16181b` | cards, sheets, header, tab bar                              |
| `--ui-surface-2`   | `ui-surface-2`   | `#1e2125` | secondary buttons, active nav item                          |
| `--ui-border`      | `ui-border`      | `#2b2f35` | borders                                                     |
| `--ui-divider`     | `ui-divider`     | `#23262b` | divider rows inside a card                                  |
| `--ui-text`        | `ui-text`        | `#f2f3f5` | primary text, the selected segment fill (with `ui-bg` text) |
| `--ui-secondary`   | `ui-secondary`   | `#c9cdd2` | secondary body text                                         |
| `--ui-muted`       | `ui-muted`       | `#a0a6ad` | captions                                                    |
| `--ui-accent`      | `ui-accent`      | `#ff4747` | dash red: icons, active tab icon, accents on dark           |
| `--ui-primary`     | `ui-primary`     | `#d63333` | filled red buttons with white text (≥ 4.5:1)                |
| `--ui-warning`     | `ui-warning`     | `#ff8800` | warning limits, the unsent dot, reconnecting                |
| `--ui-warning-bg`  | `ui-warning-bg`  | `#2a1c0a` | warning banner ground                                       |
| `--ui-warning-ink` | `ui-warning-ink` | `#ffc27a` | text on the warning ground                                  |
| `--ui-success`     | `ui-success`     | `#3dd68c` | connected, live, success                                    |
| `--ui-success-bg`  | `ui-success-bg`  | `#123826` | success ground                                              |

The older names (`ui-panel`, `ui-ink`, `ui-line`, `ui-header-*`, `ui-ok`…) are aliases of the colours
above while the surfaces that use them are rebuilt; they go when the last of those surfaces does.

## Type, radius, size

| Token           | Tailwind                          | Value                                                      |
| --------------- | --------------------------------- | ---------------------------------------------------------- |
| `--ui-font`     | `font-ui` (also the body default) | `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` |
| `--ui-font-num` | `font-num`                        | `ui-monospace, "SF Mono", Menlo, Consolas, monospace`      |
| control radius  | `rounded-control`                 | 10 px — buttons, inputs, segmented controls                |
| card radius     | `rounded-card`                    | 14 px — cards                                              |
| sheet radius    | `rounded-sheet`                   | 16 px — sheets and dialogs                                 |
| safe area       | `pb-safe-bottom`                  | `env(safe-area-inset-bottom)`, under the phone tab bar     |

Controls are 44–52 px high, list rows 48–52 px, the phone header 56 px and the tab bar 84 px including
the safe area. Every touch target is at least 44 px.

## Relation to `@canshift/core`

Core owns the dash's tokens and the brand mark, and publishes them through
`scripts/generate-tokens.css.ts` into `src/styles/tokens.generated.css`. That file stays: the canvas
preview renders the dash and must read the dash's tokens and fonts (`font-sans` is the dash's
Archivo, `font-mono` its JetBrains Mono), not the app's.

The `ui` family above is the app's chrome, which core has no consumer for.

## Rules

- `src/index.css` zeroes `border-radius` on `*`; a radius is always a deliberate `rounded-*` class.
- Focus is `outline: 2px solid var(--ui-accent)` with a 2 px offset, on every interactive element. The
  browser default ring is never acceptable.
- Two safety cues never look alike: a gauge limit is an **outlined** orange or red swatch, the
  full-screen alert is a **solid** `ui-primary` block with the full-screen corners icon.
