# CANShift Tuner — redesign handoff

Implementation spec for the new Tuner UI. The mockups are in `design/*.dc.html`:
HTML with inline styles, written for a design-canvas runtime (`<x-dc>`, `{{holes}}`,
`<sc-for>`, `<dc-import name="DashPreview">` — they won't render on their own in a
browser). **Read them as reference markup** for layout, spacing, colours and copy;
the PNG-free values are all inline. They are static mockups, **not** production
code: rebuild them as React + Tailwind + shadcn/ui components.

## 0. Ground rules

- The app is served **by the ESP32 itself**, on the dash's own Wi-Fi. **No network
  access**: no CDN, no Google Fonts, no remote images, no analytics.
- It ships inside the dash's flash: **keep the bundle small**. Tree-shake icons
  (lucide-react, import per icon), no heavy deps, system font stack only.
  Consider `preact/compat` if the bundle budget is tight.
- **Dark only.** No theme switcher, no `prefers-color-scheme` light branch.
- **Phone-first**: iPhone portrait, one-handed. Touch targets ≥ 44 px. No
  hover-only interactions. Then scale up to laptop (≥ 1024 px).
- **Out of scope**: the dash preview (`<DashPreview />`, 320×240). Reuse the
  existing pixel-faithful canvas component. Don't restyle what's inside it. Only
  scale it (1× on phone, 2× on laptop) and draw a selection ring _on top_ of it.
  `design/DashPreview.dc.html` is only a stand-in.
- Plain language everywhere. Never show a raw error code (log it to the console
  if useful).

## 1. Information architecture

Three sections. On phone they're a bottom tab bar, on laptop a left rail.

| Section              | Contents                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gauges** (default) | Page chips (Race, Street, + Add page) · live preview (tap a gauge to edit) · gauge editor sheet/panel · Add gauge · "Start from a layout" when adding a page (replaces Templates)      |
| **Car**              | Your car (ECU from the built-in catalogue, Change) · Signals list with live values, problems first · Adjust reading sheet · Raw CAN frames (last row)                                  |
| **Dash**             | Units · Brightness · Full-screen alert · CAN bus speed · Backup & restore · Update firmware (its own sub-screen) · Hardware (read-only) · Keyboard shortcuts (laptop only, behind "?") |

**Removed**: Burn (now "Send to dash"), toolbars/side menus, profiles, diagnostics
panel, CLI panel, "board" setting (read-only under Dash > Hardware).

## 2. Global chrome (every screen)

- **Connection indicator** (top-left):
  `Connected` (green dot) · `Reconnecting…` (orange, refresh icon) · `Not connected` (hollow grey dot).
- **Sync status** (top-right chip on phone, text on laptop), a button that opens the not-sent list:
  `On the dash` (green check) · `{n} change(s) not sent` (orange dot).
- **Send to dash**:
  - Phone: a 72 px bar pinned above the tab bar, shown only when there are unsent changes: `Only in this browser` + primary `Send to dash`.
  - Laptop: always in the header, top-right, disabled when nothing to send.
  - States: `Send to dash` → `Sending…` → toast `Sent. The dash is showing your changes.`
  - While reconnecting/offline: disabled, label `Send when connected`.

## 3. State model (the part that matters most)

```
deviceConfig   // last config confirmed by the dash (read on connect, after each successful send)
draftConfig    // what the user edits; persisted to localStorage/IndexedDB on EVERY change
changes        // derived: diff(deviceConfig, draftConfig) → [{where, what, was, path}]
connection     // 'connected' | 'reconnecting' | 'offline'
sendState      // 'idle' | 'sending' | 'refused' | 'failed'
```

- Every edit writes `draftConfig` to browser storage immediately → **a dropped link
  loses nothing**. On reload, restore the draft and recompute the diff once the dash answers.
- `changes.length === 0` ⇒ "On the dash". Otherwise ⇒ "{n} changes not sent".
- **Undo** per change = revert that path to `deviceConfig`'s value. **Undo all** = draft := device.
- **Send**: send the full draft → the dash validates → on OK: `deviceConfig := draft`, toast.
  - On **refusal**: keep the draft, `sendState = 'refused'`, show the reasons (see copy) with
    `Show me` (navigates to and selects the offending gauge/page) and `Not now`.
  - **Dropped mid-send**: "Couldn't finish sending — the Wi-Fi dropped. Nothing changed on the dash. Send again once you're reconnected." (Sending must be atomic on the device side.)
- Reconnect: automatic, with backoff. Banner under the header while `reconnecting`.
- Live values (signals, preview) pause while not connected; editing stays possible.
- All settings (brightness included) go through Send to dash. No instant apply.

## 4. Design tokens

Put them in `tailwind.config` / CSS vars (shadcn `--background` etc. mapped to these):

| Token       | Hex       | Use                                                                           |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| background  | `#0E0F11` | app background                                                                |
| surface     | `#16181B` | cards, sheets, nav                                                            |
| surface-2   | `#1E2125` | secondary buttons, active nav item                                            |
| border      | `#2B2F35` | borders · divider rows `#23262B`                                              |
| text        | `#F2F3F5` | primary text, "selected" segmented fill (with `#0E0F11` text)                 |
| text-muted  | `#A0A6AD` | captions · secondary body `#C9CDD2`                                           |
| accent      | `#FF4747` | dash red: icons, active tab icon, accents on dark                             |
| primary-btn | `#D63333` | filled red buttons with white text (≥ 4.5:1)                                  |
| warning     | `#FF8800` | warning limits, unsent dot, reconnecting · bg `#2A1C0A`, text on it `#FFC27A` |
| success     | `#3DD68C` | connected, live, success · bg `#123826`                                       |

- Radius: 10 px controls, 12–14 px cards, 16 px sheets.
- Fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`;
  numbers/live values: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
- Heights: inputs/buttons 44–52 px, list rows 48–52 px, phone header 56 px, tab bar 84 px (incl. safe area: use `env(safe-area-inset-bottom)`).

## 5. Safety cues (must stay visually distinct)

- **Gauge limits** (colour one gauge): _outlined_ orange/red swatch + input border.
  Label line: "Limits · Colour this gauge only". Fields: `Warning above` / `Danger above`
  (also `below` variants, and `No limit`).
- **Full-screen alert** (takes over the whole dash): _solid_ red (`#D63333`) block with
  the full-screen corners icon (lucide `Maximize`). In Dash it's a card with a red border and a solid red header.
  In the gauge editor, if the gauge's signal is the alert signal, show the solid red
  link row "Also triggers the full-screen alert above {120 °C}" → Dash.
- **Firmware update** and **Restore** always go through an `AlertDialog` that names
  what will happen. Firmware: the Install button stays disabled until both `.bin` and `.sig` are chosen.

## 6. Components (shadcn mapping)

| UI                              | shadcn / impl                                                              |
| ------------------------------- | -------------------------------------------------------------------------- |
| Tab bar (phone) / rail (laptop) | custom `<nav>` with `<a aria-current>`; switch at `lg` breakpoint          |
| Page chips                      | `ToggleGroup` (single) + dashed "Add page" `Button`                        |
| Gauge editor                    | phone: `Drawer` (vaul) / bottom `Sheet`; laptop: inline side panel         |
| Signal picker                   | `Command` inside `Popover`/`Drawer` (search, shows live value per signal)  |
| Units, Below/Above              | `ToggleGroup`                                                              |
| Brightness                      | `Slider`                                                                   |
| CAN speed, unit                 | `Select`                                                                   |
| Not-sent list                   | `Drawer` (phone) / card (laptop)                                           |
| Confirmations                   | `AlertDialog`                                                              |
| Firmware progress               | `Progress` + step list                                                     |
| Toasts                          | `sonner` (only if the bundle budget allows; otherwise a tiny custom toast) |

Selection on the preview: transparent hit areas over each gauge's rectangle (from the
layout data), plus a 2–3 px `#F2F3F5` ring around the selected one. Keyboard: arrows move selection on laptop.

## 7. Screens → mockup files

| Flow                                                     | Phone                                                                       | Laptop             |
| -------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------ |
| First open (car not chosen → 3-step setup card)          | `FirstOpen-Phone`                                                           | `FirstOpen-Laptop` |
| Edit a gauge (core loop)                                 | `EditGauge-Phone`                                                           | `EditGauge-Laptop` |
| Car + live signals                                       | `Car-Phone`, `FixSignal-Phone`                                              | `Car-Laptop`       |
| Dash settings / full-screen alert                        | `Dash-Phone`, `Restore-Phone`                                               | `Dash-Laptop`      |
| Firmware: idle → confirm → uploading → success / failure | `Firmware-Idle`, `-Confirm`, `-Uploading`, `-Success`, `-Failure`           | `Firmware-Laptop`  |
| Not connected / reconnecting / unsent / refused          | `NotConnected-Phone`, `Reconnecting-Phone`, `Unsent-Phone`, `Refused-Phone` | `States-Laptop`    |

`Main.dc.html` = structure overview, `Copy.dc.html` = full copy deck.

**First open**: if no car is set, show the 3-step card (Choose your car → Check the signals → Arrange your gauges). Once the car is set, the card disappears and the user lands directly on Gauges.

**Firmware flow details**:

- Uploading = locked full screen (no tab bar). Steps: Uploading (with MB) → Checking the signature → Installing → Restarting the dash.
- `Cancel upload` only during the upload step.
- After the restart, auto-reconnect, then Success.
- Failure always says whether the dash still runs the old version.
- Other failures: "The Wi-Fi dropped during the upload. Nothing was installed. Reconnect and try again." · "This file is for a different dash ({model})."

**Adjust reading**: shows `From the car` (raw, live) vs `Shown on dash` (computed, + "Was …").
Fields `Multiply by`, `Then add`, `Unit`. `Reset to catalogue value`.

## 8. Copy

All strings in English, centralised in one file (e.g. `src/strings.ts`) so they're easy to review.
Source of truth: `design/Copy.dc.html`. Key messages:

- Refused: title "The dash didn't accept these changes" · body "Nothing changed on the dash. Your changes are still here." · reasons:
  - "{Gauge} on page {Page} uses a signal your car doesn't send. Choose another signal or remove the gauge."
  - "Page {Page} has more gauges than fit. Remove one."
  - "The dash is out of space. Remove a page."
  - "This setup was made for newer firmware. Update the dash first."
- Map every device error code to one of these plain messages (fallback: "The dash couldn't save this. Try sending again.").
- Not connected steps: "On the dash, tap Workshop mode." · "Join the Wi-Fi it shows ({SSID}), or scan its QR code." · "Come back to this page."
- No data: "No data. Check the wiring and the CAN bus speed (Dash tab)."

## 9. Acceptance checklist

- [ ] Works one-handed at 375–430 px wide, portrait; every target ≥ 44 px.
- [ ] Killing Wi-Fi mid-edit loses nothing; reloading the page restores the draft.
- [ ] "On the dash" vs "{n} not sent" is correct after: edit, undo, send, refused send, reconnect.
- [ ] Refused send shows a plain reason + Show me jumps to the item.
- [ ] Firmware cannot start without both files AND the confirm dialog.
- [ ] Restore shows file name/date/car and asks before replacing.
- [ ] Full-screen alert visuals ≠ gauge limit visuals everywhere.
- [ ] No request leaves the device (check the Network tab); no raw error codes in the UI.
- [ ] Gzipped bundle size reported in the PR.
