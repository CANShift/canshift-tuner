# Configure with the Tuner

The Tuner is a web app served by the dash. You choose your car, arrange your gauges and set up the dash, then tap **Send to dash** and the dash reloads the new setup in place. No re-flash.

## Connecting

Over the dash's Wi-Fi (workshop mode), from any browser:

1. On the dash, tap **Workshop mode**.
2. Join the Wi-Fi it shows, or scan its QR code.
3. Open the address on the dash's screen. The Tuner connects on its own.

Over USB, from a desktop Chromium browser (recovery and development):

1. Plug the dash in over USB-C.
2. Run the tuner locally: `npm install && npm run dev` in this repo, then open the printed `localhost` address.
3. Press **Try again** on the **Not connected** screen and pick the serial port.

The indicator at the top left turns to **Connected**. While connected, the tuner sends an empty frame every 3.5 s so the dash keeps it. If the link drops, it reads **Reconnecting…** and the tuner reconnects on its own.

The dash talks to one device at a time. A second phone or laptop is turned away (WebSocket close code `4001`) and sees **Another device is connected to the dash**: close the tuner on the other device, then **Try again**.

On connect, the tuner compares the dash's gauges and pages with the ones in this browser, using the setup this browser last read from or sent to the dash as the common ground, and says which applies:

| Case          | When                                                          | What happens                                                           |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Same          | The dash holds exactly the browser's setup                    | Nothing to do                                                          |
| Browser newer | Only the browser changed since the last sync                  | **Send to dash**, or **Pull from dash** to drop the browser edits      |
| Dash newer    | Only the dash changed (or the browser had nothing of its own) | The dash's setup opens here on its own                                 |
| Different     | Both changed, or this browser never synced with this dash     | **Pull from dash** replaces the browser setup; **Undo** brings it back |
| Empty         | The dash has no setup yet                                     | **Send to dash** puts this one on it                                   |

**Pull from dash** is how a lost browser setup comes back from the car. The dash cannot hand back its signal list, so the car's signals stay as this browser has them.

> [!TIP]
> **No dash on hand?** Press **Keep editing** on the **Not connected** screen and the Tuner runs against the built-in simulator. Useful for laying out pages the night before fitting.

## The order to work in

1. **Car** — choose your car from the catalogue and check its signals come in. See [Your car](ecu-profiles.md) and [Live data](live-data.md).
2. **Gauges** — add pages and widgets, pick what each one shows, set its limits. See [Gauges & pages](widgets.md).
3. **Dash** — units, brightness, the full-screen alert, the CAN bus speed, which button turns to the next or previous page, and under **More** the screen and the dash colours. Save a backup.

## Send to dash

Every edit is kept in this browser immediately; the dash keeps its current setup until you tap **Send to dash**. The chip at the top right reads **On the dash** or **{n} changes not sent**, and opens the list with **Undo** per change and **Undo all**.

Send carries everything: pages and widgets, the car's signals (written as `/config/signals.json`), and the dash's settings.

Some changes restart the dash: the **CAN bus speed**, the car's signals, and turning the screen. One send restarts the dash at most once. When a send holds more than one change that needs a restart, the tuner sends one of them and keeps the others for the next send, saying **Send again once it is back for the rest.**

When you send, the dash shows a "Saving config…" overlay while it writes, then rebuilds its pages. If the dash refuses, the tuner names the reason and **Show me** jumps to the gauge or page at fault. If the Wi-Fi drops mid-send, nothing changed on the dash. If the dash's own overlay turns red, see [Send errors](burn-errors.md).

## The dash's own settings

**Dash** holds units, brightness, the full-screen alert, the CAN bus speed, backup and restore, the firmware update and the hardware. Its **More** row holds the rest:

| Setting             | What it does                                           | How it applies                       |
| ------------------- | ------------------------------------------------------ | ------------------------------------ |
| **Screen**          | **Day or night**, and **Turn the screen** 0° or 180°   | With Send; turning restarts the dash |
| **Calibrate touch** | Shows targets on the dash to tap, after a confirmation | At once, not through Send            |
| **Dash colours**    | The theme preset the dash uses by day and by night     | With Send                            |

## Steering wheel buttons

A button on your steering wheel can turn the dash pages. In **Dash → Steering wheel buttons**, press **Set** next to **Next page** or **Previous page** and give the CAN frame ID, the byte and the bit that button changes; **Remove** in the same sheet turns it off again. The light next to each direction comes on while its button is pressed, so you can check it from the car. Tapping the left or right edge of the dash turns pages too.

Choosing another car replaces the car's signals, so map the buttons again afterwards.

## Backup and restore

**Dash → Backup and restore** saves everything (pages, gauges, car, settings) as one `.canshift` file. **Restore from file…** reads a backup, names its file, date, car and number of pages, and asks before replacing your setup and sending it to the dash.

## Schema vs firmware version

The firmware checks the `version` of the stored `dashboard.json` against the schema it was built with. It still loads the file and flags the gap in the ErrorBar: `VER_MAJOR` when the major version differs, `VER_OLD` when the file predates grid layouts (schema 1.25) and the gauges stack up. Send to dash again: the tuner always writes the current schema. If the dash answers that the setup was made for newer firmware, [update the dash](firmware-update.md) first.

## Next

- [Send errors](burn-errors.md) — what each red overlay message means and how to recover.
- [Navigating pages](https://github.com/CANShift/canshift-firmware/blob/main/docs/guide/navigating-pages.md) — gestures and the page cap on the dash.
- [Cruise control](https://github.com/CANShift/canshift-firmware/blob/main/docs/guide/cruise-control.md) — how the cruise page binds to your ECU's `cruise_setpoint`.
