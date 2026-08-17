# Tuner documentation

The tuner is the browser configurator: it flashes the dash, edits the
dashboard, and reads live CAN data over Web Serial. Start with
[First flash](install/first-flash.md) if the board is still sealed, or
[Tuner tour](tour.md) if it already boots.

You need a Chromium browser (Chrome, Edge, Brave, Opera) — Web Serial does not
exist in Firefox or Safari.

Docs for the other repos: [firmware](https://github.com/CANShift/canshift-firmware/tree/main/docs) ·
[core](https://github.com/CANShift/canshift-core/tree/main/docs) ·
[mobile](https://github.com/CANShift/canshift-mobile/tree/main/docs)

## Install

| Doc                                        | What it covers                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| [First flash](install/first-flash.md)      | Sealed board to booting dashboard, about five minutes               |
| [Manual flash](install/manual-flash.md)    | `esptool` over USB when the in-browser flasher will not do          |
| [Boot diagnostics](install/boot-issues.md) | Splash hangs, ErrorBar messages, silent USB — reading the boot logs |

## Configure

| Doc                                                 | What it covers                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| [Configure with the Tuner](configure/with-tuner.md) | Live editing over Web Serial — pages, signals, ECU profiles, themes    |
| [ECU profiles](configure/ecu-profiles.md)           | Load a signal set for your car, from the catalogue or your own CAN XML |
| [Widgets & pages](configure/widgets.md)             | Building the dashboard within the firmware's limits                    |
| [Live data](configure/live-data.md)                 | Watching decoded signals in real time — car, simulator, or neither     |
| [Burn errors](configure/burn-errors.md)             | When the burn overlay turns red, and how to recover                    |

## The app itself

| Doc                               | What it covers                        |
| --------------------------------- | ------------------------------------- |
| [Tuner tour](tour.md)             | A map of every tab and what it is for |
| [Layout editor](layout-editor.md) | Canvas, page strip, property panel    |

## Elsewhere

- The JSON the tuner reads and writes is defined in
  [core's config contract](https://github.com/CANShift/canshift-core/blob/main/docs/config-contract.md);
  the firmware/tuner handshake rule is in
  [wire protocol versioning](https://github.com/CANShift/canshift-core/blob/main/docs/wire-protocol-versioning.md).
- Firmware images and release notes:
  [canshift-firmware releases](https://github.com/CANShift/canshift-firmware/releases).
