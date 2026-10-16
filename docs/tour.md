# Tuner tour

The Tuner is a browser app that talks to the dash over its Wi-Fi (a WebSocket) or over USB (Web Serial). It has three sections: a bottom tab bar on a phone, a left rail on a laptop. This page is the map, with links to the guides that go deeper.

## The sections

| Section    | Path      | What it holds                                                                                                                                                                                                                                          |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Gauges** | `/gauges` | Pages, the dash preview with its preview modes, and the editor for every widget: gauges, buttons, gear indicators and shift lights. A page can be a cruise control page. See [Gauges](layout-editor.md).                                               |
| **Car**    | `/car`    | Your car from the built-in catalogue, its signals with live values next to the live plot, adjusting a reading, and under **More** OBD-II polling and trouble codes, profile files (XML) and raw CAN frames. See [Your car](configure/ecu-profiles.md). |
| **Dash**   | `/dash`   | Units, brightness, the full-screen alert, CAN bus speed, backup and restore, the firmware update and the hardware; under **More**, the screen (day or night, turn, calibrate touch) and the dash colours.                                              |

The first time, with no car chosen, Gauges shows a three-step card: choose your car, check the signals come in, arrange your gauges. Once the car is set, the card goes away.

Old links (`/vehicle`, `/device`, `/signals` and the rest) redirect to the section that now holds them.

## Sending to the dash

Every edit is kept in this browser the moment you make it, so a Wi-Fi drop or a reload loses nothing. Nothing reaches the dash until you tap **Send to dash**.

- The chip at the top right reads **On the dash** when the dash holds exactly what you see, or **{n} changes not sent**. It opens the list of what is not sent, each with **Undo**, plus **Undo all**.
- On a phone, **Send to dash** sits in a bar above the tabs while there is something to send. On a laptop it is always in the header.
- Send carries everything: pages and widgets, the car's signals, and the dash's settings. Brightness, day or night and the dash colours apply in place.
- The CAN bus speed, the car's signals and turning the screen restart the dash. One send restarts it at most once; any other change that needs a restart waits for the next send.
- **Calibrate touch** is the exception to Send: it starts on the dash at once, after a confirmation.
- If the dash refuses, the tuner says why in plain words and **Show me** jumps to the gauge or page at fault. Your changes stay in the browser.
- If the Wi-Fi drops mid-send, nothing changed on the dash. Send again once reconnected.

## Connection

The indicator at the top left reads **Connected**, **Reconnecting…** or **Not connected**. The tuner reconnects on its own; live values pause meanwhile and editing keeps working. While connected, the tuner sends an empty frame every 3.5 s so the dash keeps it. The dash talks to one device at a time: a second phone or laptop is turned away (close code `4001`) and sees **Another device is connected to the dash**.

The state model is in [the redesign handoff](redesign/HANDOFF.md#3-state-model-the-part-that-matters-most).

> [!NOTE]
> Served by the dash, the Tuner works in any browser on the dash's Wi-Fi. Over USB it needs a desktop Chromium-based browser. Bluetooth is the mobile app's job; see [Pairing over BLE](https://github.com/CANShift/canshift-mobile/blob/main/docs/pairing.md).

## No dash? Keep editing

On the **Not connected** screen, **Keep editing** opens the tuner against the built-in simulator, so you can lay out pages and watch signals move without a dash. **Try again** connects when the dash is back.

## Not in the tuner

The command line, the diagnostics panel, profiles and projects, page templates (replaced by **Start from a layout**), board profile provisioning, and dragging, resizing, aligning or copy-pasting widgets on the preview. The board is read-only under **Dash → Hardware**.

## On a laptop

The arrow keys move the gauge selection on the preview and **Esc** closes the gauge editor. Press **?** to list the shortcuts.
