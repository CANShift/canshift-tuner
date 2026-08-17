# Prompt — CANShift Tuner (web app)

For Claude Code in `canshift-tuner`. The reference is `CANShift Tuner v2.dc.html` in this folder: open it in
a browser (keep `support.js` and `_ds/` beside it) and click through it. This document is self-sufficient —
the mockup only confirms proportions.

The Tuner is a browser app that writes a dashboard config to a CANShift dash over USB (Web Serial). It is
not a website: no marketing, no logo mid-page, no centred copy.

---

## 1. Design language

Black, white, red. Everything flush left, radius 0 everywhere, no shadow, no gradient. Rules organise the
page: **2 px** for major separations (header, section heads, table heads), **1 px** between rows.

The whole UI is driven by CSS custom properties on a `data-ui="light"|"dark"` root, so the theme switch in
the header is one attribute change. Never hard-code these colours in components:

| Token          | Light                | Dark                    | Use                                |
| -------------- | -------------------- | ----------------------- | ---------------------------------- |
| `--t-bg`       | `#f3f2f2`            | `#17161a`               | page ground                        |
| `--t-panel`    | `#eae9e9`            | `#201f24`               | hover, inset panels, canvas ground |
| `--t-ink`      | `#201e1d`            | `#f3f2f2`               | text, borders, 2 px rules          |
| `--t-muted`    | `#605d5d`            | `#a09da3`               | labels, secondary text             |
| `--t-faint`    | `#8a8785`            | `#7a777d`               | tertiary, disabled text            |
| `--t-line`     | `rgba(32,30,29,.16)` | `rgba(243,242,242,.16)` | 1 px separators                    |
| `--t-line2`    | `rgba(32,30,29,.3)`  | `rgba(243,242,242,.32)` | input borders                      |
| `--t-rule`     | `#201e1d`            | `#f3f2f2`               | 2 px rules                         |
| `--t-hdr-bg`   | `#201e1d`            | `#0d0d0f`               | header + footer ground             |
| `--t-hdr-ink`  | `#f3f2f2`            | `#f3f2f2`               | header text                        |
| `--t-hdr-dim`  | `#b9b6b4`            | `#86838a`               | header idle text                   |
| `--t-hdr-line` | `#3a3736`            | `#2b2a30`               | header separators                  |

Accent `#ec3013` (primary action, active tab, current page outline). Warning `#FF8800`. Danger `#FF4444`.
Engaged `#FF4747` (dash buttons only). OK `#00cc2a` (connected, success). The CLI is always `#0d0d0d`,
in both themes.

Type: **Archivo** 400–800 for anything that speaks (labels, buttons, titles), **JetBrains Mono** for
anything that measures (every value, ID, byte, version, path). Tabular numerals on all readouts.

## 2. Shell

Three rows, fixed: header 52 px, view (scrolls), footer 34 px. `min-width: 900px`; below that the page
scrolls horizontally rather than clipping.

**Header** — mark + `CANSHIFT` + `TUNER` tag, the config-name input (only in an editing session), then the
tabs `HOME · DASH · SIGNALS · LIVE · DEVICE`, a spacer, the connection chip, `DISCONNECT`, the theme
toggle, `SAVE`, `BURN`. It must survive its longest state (`BURN` can read `OUT OF BOUNDS`): the name
input shrinks (`flex: 0 1 160px; min-width: 56px`), every label is `nowrap`, and the `TUNER` tag hides
below 1000 px. Never hide the theme toggle.

**Footer** — the CLI handle on the left (Dash only; the bar turns `#0d0d0d` with a 2 px accent top border
when the CLI is collapsed) and the device readout on the right: green dot + panel model + ECU profile +
`fw 0.1.0`, or `NO DEVICE · <profile>`.

**Gating.** DASH, SIGNALS, LIVE and DEVICE need a board. With none they are `--t-hdr-line`,
`cursor: not-allowed`, and clicks do nothing. `Edit offline` turns on **simulation mode**: the four tabs
open, a full-width `#ec3013` strip reads `MODE SIMULATION ACTIVATED · editing a config without a board ·
burning is disabled` with a `TURN OFF` button, and `BURN` stays disabled reading `NO DEVICE`. HOME stays
reachable at all times.

## 3. HOME — three panes in a 208 px rail

**Welcome** — status kicker over a 2 px rule, "Plug the dash in.", the three connect steps, `CONNECT`
(accent) + `Edit offline` (outlined), then RECENT CONFIGS from local storage (name + `ECU · panel ·
N pages`). On first run, before that list: a choice between `SIX DEFAULT PAGES` and `One blank page`.
A dismissible dark band at the bottom announces a firmware update (`0.1.0 → 0.1.1`) with `GO TO FLASH`
and `Changelog ↗`; it never overlaps the rows because it is in the flow, not absolute.

**Flash** — panel **model** first (`CrowPanel 2.8″ · ILI9341`, 3.5″ ST7796, 4.3″ and 7.0″ EK9716BD3),
because firmware builds are per model, then a `FLASH` / `ERASE` segmented control. FLASH shows the
version select (0.1.1 LATEST … 0.0.8) and, under it, the changelog of the selected version with `ADD`
(accent) / `FIX` (ink) / `CHG` (faint) tags — picking an older version adds an amber "this is a rollback"
line. ERASE explains what is wiped and offers `Export config first`.
While running: a black block with the step, the percent at 30 px, a 10 px bar, `DO NOT UNPLUG` in amber,
and the step list below with `✓` done / `›` running / `·` pending (CONNECT, CHECK MODEL, WRITE, VERIFY,
REBOOT — or CONNECT, ERASE, VERIFY). Then a green-ruled DONE panel with `OPEN THE DASH`. Drive progress
from elapsed time so a remount cannot freeze it.

**Contact** — type (BUG / ECU REQUEST / QUESTION), email, message; for a bug, the board/config context is
attached automatically and can be removed. A FILES block: `Attach files`, `Attach current config`,
`Download report` (a text file with board, firmware, ECU, bus, config counts, the message and the config
JSON). Validate email and message before sending.

## 4. DASH — the editor

**Toolbar** (54 px): `PAGE` label, the page select (`PAGE 3 · BOOT`), five 38 px square page buttons
(boot star, duplicate, move earlier, move later, undo, delete — delete red, disabled at one page), the
panel-model select, the preview mode buttons `NORMAL / CUT / SPLASH / ALERT`, the profile meta
(`MegaSquirt MS3 · 500 kbit · 842 Hz`, hidden below 1180 px), then `Import`, `Export`, `Add widget`.

**Canvas** — a horizontal strip on `--t-panel` holding **every page**: the edited one at full scale with a
2 px accent outline, the others as 42 %-scale thumbnails at 50 % opacity, clickable to switch. The strip
re-centres the edited page on every change (page select, thumbnail click, CLI). Scale comes from measuring
the strip's height with a ResizeObserver — CSS cannot compute it — and the resize grip's width is divided
by that scale so it stays 12 px on screen.

Each page renders exactly like the dash: optional 12-cell shift light, three-field status row, then the
12-column widget grid. The dash's own grammar is binding — see `DASH_DESIGN_SYSTEM.md`.

**Editing gestures** (current page only): click selects, drag reorders, drag the right edge changes the
span in whole columns. Preview modes overlay the real dash states: CUT inserts the amber band under the
status row, SPLASH takes the panel with the anti-lag receipt, ALERT takes it with the red takeover.

**Widget list** (356 px, right): WIDGET / SIGNAL / TYPE only — the span is set by dragging, so it is not
duplicated here. The signal field is a searchable input backed by a `<datalist>`; type is value / bar /
gauge / button. Below it, the selected widget's editor: NAME, move up/down, `WARN AT`, `DANGER AT` and an
`above` / `below` direction. Footer: the fit verdict, the wheel order, `Paste <name>` when a widget is
copied, and `Remove`.

**Validation.** `BURN` is only enabled with a board, a layout that fits the panel, and no widget bound to
a signal without a CAN ID or polled PID. Otherwise it reads `OUT OF BOUNDS` / `N UNBOUND` / `NO DEVICE`
in grey, and the canvas carries the matching amber band. A rejected write shows `BURN FAILED · E_EMPTY_PAGE
· page 4 has no widgets`, states that the dash kept its previous config, and offers RETRY / Dismiss.

**CLI** — collapsible black panel, 148 px. Commands are typed with a leading slash; `/help` lists them.
Typing filters a suggestion list above the prompt (first entry highlighted, click or Tab to accept), ↑ / ↓
walk the history. Commands: `help ls page boot bind span type id theme alert copy paste undo scan save
export import burn`. Everything the UI can do, the CLI can do.

## 5. SIGNALS

Toolbar: a `CAN` / `OBD-II` segmented control, the ECU profile select (MaxxECU, ECUMaster Black,
MegaSquirt MS3, Link G4X, Haltech Elite, Motec M1, AEM Infinity, Generic OBD-II, Custom profile), the
count (`13 of 25 bound · 500 kbit · 842 Hz`), a filter field, `SCAN BUS`, `Import XML`, `Download XML`.

**CAN** — a wide table: SIGNAL, CAN ID (editable), BYTES (editable), VALUE (right-aligned, tabular), UNIT
(a select where an imperial equivalent exists — km/h ↔ mph, °C ↔ °F, bar ↔ psi, km ↔ mi — converting the
displayed value), USED ON PAGES as small numbered chips. Unbound signals are faint and read `not used`.
Generous columns: 40 px gaps, 28 px row padding.

**SCAN BUS** — discovered frames arrive one by one: ID, rate, raw bytes, what it is already bound to, and
an `assign to…` select. Rows must stay on one line (five grid tracks, five children always rendered).

**OBD-II** — the standard PIDs (0x0C rpm, 0x0D speed, 0x05 water, 0x0F iat, 0x11 throttle, 0x0B boost,
0x2F fuel, 0x42 batt), a poll-rate select, and a per-row `polled` / `skip` toggle plus the pages using it.
A polled PID counts as a binding, so a widget bound to it does not block the burn.

`SAVE` writes the profile locally; `BURN` is the separate act of writing to the dash. The XML profile is
`<canshift-profile><signals><signal name id bytes unit/>…`.

## 6. LIVE

Toolbar: `LIVE DATA`, the state (`listening · 500 kbit · 842 Hz · CAN`), the sample count while recording,
`RECORD` / `STOP & SAVE` (downloads a CSV), and `START` / `PAUSE`.

A grid of cards for every bound signal — name, CAN ID in accent, value at 30 px tabular, a bar — each
clickable to add it to the plot. Below, the plot: SVG polylines, one colour per signal, each normalised to
its own range so they share one frame; a legend with each signal's min–max; a `−` / `+` pair stepping the
time window by 5 s between 5 s and 120 s; and a checkbox column listing every bound signal with its
colour swatch. Samples are deterministic per tick so cards, plot and CSV agree.

## 7. DEVICE

Four full-width sections, top to bottom, each under a 2 px rule:

1. **BOARD** — a 3 × 2 band: MODEL, DISPLAY (`ILI9341 · 320 × 240`), FIRMWARE, TRANSPORT (`USB CDC` —
   BLE is the phone's transport, never the Tuner's), ECU PROFILE, CONFIG (`6 pages · 41 widgets`).
2. **SETTINGS** — two columns of rows, each with a label, a one-line consequence, and a select on the
   right: MODEL, BUS RATE, UNITS (switches every signal that has an equivalent), BRIGHTNESS.
3. **THEME** — the six dash themes in a balanced 3 × 2 grid (NIGHT, DAY, RALLY, AMBER, MONO, DUSK). Each
   card renders a real sample in that theme — a value with a bar, a danger widget, an engaged button — so
   it shows that danger red and engaged red never change with the theme.
4. **CRITICAL ALERT** — signal, `FIRES AT`, direction, acknowledge target (dash / phone / both), with the
   red takeover previewed beside the fields.

In simulation mode a line at the top states that these are the values the config will write, not what a
dash reports. No firmware actions here — flashing lives on Home.

## 8. State, storage, files

Client-side only. `SAVE` (or ⌘S) writes pages, signal map, panel, theme, bus, units, ECU profile, boot
page, polled PIDs, the critical alert and the config name to local storage, and adds an entry to RECENT
CONFIGS; the app restores it on load and shows the first-run choice when there is nothing.

`Export` downloads `canshift-<model>.canshift` — JSON carrying `name`, `device`, `screen {w,h}`, `bus`,
`units`, `theme`, `bootPage`, `wheelOrder`, `criticalAlert`, `signals[]` and `pages[]` (each widget with
kicker, signal, type, span, size, danger, warnAt, dangerAt, dir). `Import` accepts it back and, when the
file names another panel, switches the panel and says so in an amber band.

Keyboard: ⌘Z undo (25 snapshots, every mutation), ⌘S save, ⌘C / ⌘V copy-paste a widget, Delete removes the
selected widget, arrows move the selection. Shortcuts must not fire while a field has focus.

## 9. Non-negotiable

- **Never render or fake a value the app is not receiving.** `- -` is the dash's stale-signal state and
  belongs nowhere else.
- The dash preview follows the selected theme; the dash's own grammar (a rule, a kicker, a value — never a
  card) is set by `DASH_DESIGN_SYSTEM.md` and must not be reinterpreted here.
- One accent. No second red, no icon in the primary nav, no emoji.
- Every interactive element gets a hover and a `:focus-visible { outline: 2px solid #ec3013; outline-offset:
2px }` — never the browser default.
- Verify at 1600 / 1280 / 1180 / 1024 / 980 / 924 px: no clipped control, no wrapped button label, no
  horizontal overflow inside a panel.

## 10. Order of work

1. Tokens, both themes, the shell (header, gated tabs, footer) and the view router.
2. HOME: welcome, first run, simulation mode.
3. DASH: the carousel with measured scaling, page CRUD, the widget list and the selected-widget editor.
4. Editing gestures: drag to reorder, drag to resize, thresholds, preview modes.
5. SIGNALS: CAN table, scan, OBD-II, XML.
6. LIVE: cards, plot, recording.
7. DEVICE: the four sections.
8. Storage, import/export, keyboard, then the burn and flash paths with their failure states.
