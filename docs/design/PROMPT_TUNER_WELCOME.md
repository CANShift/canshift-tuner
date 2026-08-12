# Prompt — Tuner welcome screen

For Claude Code in `canshift-tuner`. Visual reference: the `Welcome` view in `CANShift Tuner.dc.html`
(sidebar → Welcome). This document is self-sufficient; the mockup is only there to confirm proportions.

---

You are building (or correcting) the CANShift Tuner's welcome screen — the view shown when the app opens
and no device is connected. Read the whole spec, then implement.

## What this screen is for

Two jobs, in this order: **get back to work** (resume a config you already made) and **get connected**
(plug the dash in). It is not a landing page. There is no logo, no marketing hero, no centred copy, and
no fake dashboard rendering — the app must never draw a dash it is not talking to.

## Layout

Two columns inside the normal app chrome (header 56 px, sidebar 236 px, both unchanged):

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| Left column  | `minmax(360px, 470px)`, 2 px right divider, padding `44px 40px 0` |
| Right column | `minmax(0, 1fr)`, ground `--color-neutral-100`                    |

Below **1180 px** the two columns stack (`display: block` on the wrapper, children reset to
`min-height: auto; overflow: visible`, the wrapper itself scrolls). The app floor is `min-width: 980px`;
below it the page scrolls horizontally rather than clipping.

Everything is flush left. Radius 0 everywhere. Rules do the organising: 2 px for major separations, 1 px
between list rows.

## Left column — connect

1. **Status kicker** — `NO DEVICE CONNECTED`, mono 10.5 px, 0.2em, `--color-neutral-600`, over a **2 px**
   bottom divider. This is the only place the connection state is stated.
2. **Title** — "Configure your dash, live." Archivo 800, 38 px, -0.035em, line-height 1.04.
3. **Dek** — "Pages, CAN bindings and OBD-II polling, edited in the browser against the dash on your
   desk. Nothing to install, nothing to deploy." 15 px / 1.6, `--color-neutral-700`, max 42ch.
4. **Actions** — two buttons, `gap: 1px`, labels **flush left**, `white-space: nowrap`:
   - `CONNECT DEVICE` — accent fill, white, Archivo 800 13 px, 0.1em, padding 15 × 22. Hover
     `--color-accent-600`.
   - `Explore with sample data` — 1 px `--color-neutral-400` outline, transparent, 13 px / 700.
5. **`TO CONNECT`** — mono 10.5 px, 0.18em kicker over a 1 px rule, then three rows separated by 1 px
   rules, each `mono number (16 px wide) + title 14 px/700 + line 13.5 px`:
   - `01 Plug the dash in` — USB-C, straight into the computer. No hub.
   - `02 Pick the port` — The browser asks which USB port to use.
   - `03 Start tuning` — Edit pages and widgets — the dash updates as you type.
6. **Footer**, pushed down with `margin-top: auto` — About · Troubleshooting · Report a problem, mono
   11 px.

## Right column — the bench

The recent configs, so a returning user resumes in one click. **This is the point of the screen.**

- **Toolbar**, 40 px, 2 px bottom divider, mono 10.5 px 0.14em `--color-neutral-600`: `YOUR BENCH` on the
  left, `N CONFIGS · LOCAL` on the right.
- **One row per config**, `grid-template-columns: 100px minmax(0, 1fr) auto`, gap 20, padding 18 × 22,
  1 px bottom rule, whole row clickable, hover `--color-neutral-200`:
  - **Thumbnail**, 100 × 70, drawn in the config's _own dash theme_ (night configs on `#121212` with
    white ink, day configs on `#DDDDDD` with black ink): a 2 px top rule, one representative value in
    mono 17 px, a 1 px rule pushed to the bottom, and `6 PAGES · NIGHT` in mono 8 px. It is a miniature
    of the real page grammar, not a screenshot and not an icon.
  - **Middle**: config name in Archivo 800 15.5 px, then `ECU · bus rate · signal count` in mono 11.5 px
    `--color-neutral-600` (e.g. `MegaSquirt MS3 · 500 kbit · 46 signals`).
  - **Right**: relative date in mono 11.5 px, and `RESUME →` in the accent underneath.
- **`+ Start a new config`** as the last row, same rhythm, accent `+` occupying the thumbnail column:
  title plus "from a blank dash, or from one of the six defaults".
- **Footer**, 2 px top divider, mono 11 px: "Configs live in this browser." + `Export ↗`, and
  `Import a config file` pushed right.

### Empty state (first run)

No bench rows exist. Do **not** show an empty panel: promote `Start a new config` to fill the column —
the six default pages (Street, Track, Engine, Tuning, Timing, Controls) as pickable rows using the same
thumbnail treatment, under a `START FROM A DEFAULT` toolbar label. The left column is unchanged.

## Behaviour

| Interaction                               | Result                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `CONNECT DEVICE`                          | Web Serial port picker; on success go to Pages & widgets with the device attached              |
| `Explore with sample data`                | loads the sample config into the editor, header keeps `no device`                              |
| Row click / `RESUME →`                    | opens that config in Pages & widgets                                                           |
| `+ Start a new config`                    | new blank config, or the defaults picker                                                       |
| `Export ↗` / `Import`                     | download / upload the config JSON                                                              |
| A device connects while this view is open | leave the screen; navigation is the user's call, but the header status must update immediately |

Configs are stored client-side (IndexedDB or localStorage). The footer line saying so is not decoration —
it sets the expectation that clearing the browser loses them, which is why Export is next to it.

## Non-negotiable

- **Never render a dash the app is not connected to.** The thumbnails are miniatures of saved configs —
  real user data — not a live-looking dashboard. `- -` means _the sensor went quiet_ and must not be used
  as a "no device" placeholder anywhere.
- No logo on this screen. The mark is already in the header.
- Nothing centred, no radius, no shadow, no gradient, no second accent.
- Button labels flush left even when the button is wider than the label.
- Focus: `outline: 2px solid var(--color-accent); outline-offset: 2px` — never the browser default.
- Rows must survive a narrow viewport: the meta line may wrap to two lines, never to one word per line.
  Verify at 1600 / 1280 / 1180 / 1024 / 980 px.
