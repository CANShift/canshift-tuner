# Tuner tour

The Tuner is a browser app that talks to the dash over its Wi-Fi (a WebSocket) or over USB (Web Serial). It has three sections (`src/constants/routes.ts`): a bottom tab bar on a phone, a left rail on a laptop. This page is the map, with links to the guides that go deeper.

## Sending to the dash

Every edit stays in this browser until you tap **Send to dash**, and is saved there the moment you make it, so a Wi-Fi drop or a reload loses nothing.

- The chip at the top right says **On the dash** when the dash holds exactly what you see, or **{n} changes not sent**. It opens the list of what is not sent, each with **Undo**, plus **Undo all**.
- **Send to dash** sends the whole setup: the dashboard, then the brightness, then the CAN bus speed (which restarts the dash). The dash keeps its old setup if anything fails.
- If the dash refuses, the tuner says why in plain words and **Show me** jumps to the gauge or page at fault. If the Wi-Fi drops mid-send, nothing changed on the dash; send again once reconnected.
- The connection indicator at the top left reads **Connected**, **Reconnecting…** or **Not connected**. The dash talks to one device at a time: when another phone or laptop keeps taking it over, the tuner stops reconnecting and says so.

The state model is in [the redesign handoff](redesign/HANDOFF.md#3-state-model-the-part-that-matters-most); the code is `src/lib/sync/` (diff, undo, send) and `src/stores/sync/`.

## The sections

- **Gauges** (`/gauges`) — the page strip, the canvas and the selected widget's properties. The canvas renders each page as the dash does. See [Layout editor](layout-editor.md) and, for the workflow, [Widgets & pages](configure/widgets.md).
- **Car** (`/car`) — pick an ECU profile, edit CAN signals or OBD-II polling, scan the bus and watch live values. See [ECU profiles](configure/ecu-profiles.md) and [Live data](configure/live-data.md). The CAN bus speed is set here for now.
- **Dash** (`/dash`) — units, brightness, the full-screen alert, backup and restore, and the firmware update.

Old links (`/dash`'s previous editor, `/vehicle`, `/device`, `/signals` and the rest) redirect to the section that now holds them.

> [!NOTE]
> Served by the dash, the Tuner works in any browser on the dash's Wi-Fi. Over USB it needs a desktop Chromium-based browser. Bluetooth is the mobile app's job; see [Pairing over BLE](https://github.com/CANShift/canshift-mobile/blob/main/docs/pairing.md).

## No car? Use the simulator

Every tab works against the built-in simulator, so you can lay out a dashboard and watch signals move without a device connected. The connection indicator reads **Not connected** while you edit against it; tap it to connect a dash.
