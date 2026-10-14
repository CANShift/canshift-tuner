# Tuner tour

The Tuner is a browser app that talks to the dash over Web Serial. It has three tabs (`src/constants/routes.ts`); this page is the map, with links to the guides that go deeper.

Until a dash is connected, the Tuner shows a connect panel: **Connect** opens the browser's serial port picker, **Edit offline** opens a config in the simulator with burning disabled.

## The tabs

- **Dash** (`/dash`) — the page strip, the canvas and the selected widget's properties. The canvas renders each page as the dash does. See [Layout editor](layout-editor.md) and, for the workflow, [Widgets & pages](configure/widgets.md). The dash theme (presets and the day/night preview) folds out under the widget list, and a CLI console for the wire protocol from the bottom of the tab.
- **Vehicle** (`/vehicle`) — three sections:
  - **Profile & signals** — pick an ECU profile, edit CAN signals or OBD-II polling, scan the bus, and analyse unknown frames. See [ECU profiles](configure/ecu-profiles.md).
  - **Live values** — every decoded signal with its current value, a plot, and CSV recording. See [Live data](configure/live-data.md).
  - **CAN bus** — the bus speed the dash listens at (125, 250, 500 or 1000 kbit/s), read from the dash and written back to it. Writing it reboots the dash.
- **Device** (`/device`) — settings (panel model, units, brightness) on one side, the board profile and its definition, and config backup and restore on the other.

Old links (`/signals`, `/live`, `/dashboard`, `/themes` and the rest) redirect to the tab that now holds them.

> [!NOTE]
> The Tuner speaks **Web Serial** over USB — it needs a Chromium-based browser and a wired connection. Bluetooth is the mobile app's job; see [Pairing over BLE](https://github.com/CANShift/canshift-mobile/blob/main/docs/pairing.md).

## No car? Use the simulator

Every tab works against the built-in simulator, so you can lay out a dashboard and watch signals move without a device connected. The **Live values** header says whether you are looking at simulated or live data.
