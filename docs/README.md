# Tuner documentation

The tuner is the browser configurator: it edits the dashboard and reads live
CAN data. The dash serves it in workshop mode and the tuner talks back over a
WebSocket on the dash's Wi-Fi, from any browser, phones included. A desktop
Chromium browser (Chrome, Edge, Brave, Opera) can also connect over USB with
Web Serial. Put firmware on a sealed board with
[Manual flash](install/manual-flash.md), then start with the
[Tuner tour](tour.md).

Docs for the other repos: [firmware](https://github.com/CANShift/canshift-firmware/tree/main/docs) ·
[core](https://github.com/CANShift/canshift-core/tree/main/docs) ·
[mobile](https://github.com/CANShift/canshift-mobile/tree/main/docs)

## Install

| Doc                                        | What it covers                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| [Manual flash](install/manual-flash.md)    | `esptool` over USB — writing firmware and recovering a stuck board  |
| [Boot diagnostics](install/boot-issues.md) | Splash hangs, ErrorBar messages, silent USB — reading the boot logs |

## Configure

| Doc                                                 | What it covers                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Configure with the Tuner](configure/with-tuner.md) | Connecting, the order to work in, Send to dash and restarts, the dash's own settings                            |
| [Your car](configure/ecu-profiles.md)               | Your car from the catalogue, the live plot, adjusting a reading, OBD-II, XML profiles, raw frames, signals.json |
| [Gauges & pages](configure/widgets.md)              | Pages and cruise pages, every widget type, More options, limits vs full-screen alert, preview modes             |
| [Live data](configure/live-data.md)                 | Live values and the live plot — car or simulator — and what No data means                                       |
| [Send errors](configure/burn-errors.md)             | When the dash's saving overlay turns red, and how to recover                                                    |
| [Firmware update](configure/firmware-update.md)     | Installing a new firmware from Dash → Update firmware                                                           |

## The app itself

| Doc                        | What it covers                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| [Tuner tour](tour.md)      | The three sections (Gauges · Car · Dash), Send to dash, the connection, what is not in the tuner |
| [Gauges](layout-editor.md) | Page chips, the dash preview and its modes, Add, the gauge editor and More options               |

## Design

The binding references for what the app looks like. The comps they confirm live in
[canshift-brand/design](https://github.com/CANShift/canshift-brand/tree/main/design) — open them there,
the whole folder has to stay together.

| Doc                                                | What it covers                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Dash design system](design/DASH_DESIGN_SYSTEM.md) | The dash's own grammar — binding on the canvas preview, not reinterpretable here |
| [Dash pages](design/DASH_PAGES.json)               | The six reference pages as data, in device pixels                                |
| [Tuner tokens](design/tokens.md)                   | The app's design language and colour vocabulary — token, CSS variable, Tailwind  |
| [Redesign handoff](redesign/HANDOFF.md)            | The three-section app (Gauges · Car · Dash), its state model, screens and copy   |

## Elsewhere

- The JSON the tuner reads and writes is defined in
  [core's config contract](https://github.com/CANShift/canshift-core/blob/main/docs/config-contract.md);
  the firmware/tuner handshake rule is in
  [wire protocol versioning](https://github.com/CANShift/canshift-core/blob/main/docs/wire-protocol-versioning.md).
- Firmware images and release notes:
  [canshift-firmware releases](https://github.com/CANShift/canshift-firmware/releases).
