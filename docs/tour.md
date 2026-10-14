# Tuner tour

The Tuner is a browser app that talks to the dash over Web Serial. It has three tabs (`src/constants/routes.ts`); this page is the map, with links to the guides that go deeper.

Until a dash is connected, the Tuner shows a connect panel: **Connect** opens the browser's serial port picker, **Edit offline** opens a config in the simulator with burning disabled.

## The tabs

- **Dash** (`/dash`) — the page strip, the canvas and the selected widget's properties. The canvas renders each page as the dash does. See [Layout editor](layout-editor.md) and, for the workflow, [Widgets & pages](configure/widgets.md). A CLI console for the wire protocol folds out from the bottom of this tab.
- **Vehicle** (`/vehicle`) — two sections:
  - **Profile & signals** — pick an ECU profile, edit CAN signals or OBD-II polling, scan the bus, and analyse unknown frames. See [ECU profiles](configure/ecu-profiles.md).
  - **Live values** — every decoded signal with its current value, a plot, and CSV recording. See [Live data](configure/live-data.md).
- **Device** (`/device`) — panel model, units, brightness, the board profile and its definition, config backup and restore, and the dash theme.

Old links (`/signals`, `/live`, `/dashboard`, `/themes` and the rest) redirect to the tab that now holds them.

> [!NOTE]
> The Tuner speaks **Web Serial** over USB — it needs a Chromium-based browser and a wired connection. Bluetooth is the mobile app's job; see [Pairing over BLE](https://github.com/CANShift/canshift-mobile/blob/main/docs/pairing.md).

## No car? Use the simulator

Every tab works against the built-in simulator, so you can lay out a dashboard and watch signals move without a device connected. The **Live values** header says whether you are looking at simulated or live data.
