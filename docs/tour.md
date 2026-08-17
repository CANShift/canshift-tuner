# Tuner tour

The Tuner ([canshift-tuner](https://tuner.canshift.app)) is a browser app that talks to the dash over Web Serial. It is organised as a set of tabs (`src/constants/routes.ts`); this page is the map, with links to the tabs that have their own guide.

## The tabs

- **Welcome** (`/`) — connect a device, or drop straight into the simulator.
- **Editor** (`/dashboard`) — the visual layout editor: pages, widgets, colours. See [Layout editor](layout-editor.md) and, for the workflow, [Widgets & pages](configure/widgets.md).
- **CAN bus** (`/can`) — a live scan of the frames on the bus, for working out which IDs your car sends.
- **ECU** (`/ecu`) — pick a signal profile from the catalogue or import your own. See [ECU profiles](configure/ecu-profiles.md).
- **OBD-II** (`/obd2`) — configure OBD-II PID polling for cars that don't broadcast.
- **Themes** (`/themes`) — day and night palettes for the dash.
- **Live data** (`/live`) — every decoded signal with its current value. See [Live data](configure/live-data.md).
- **Logs** (`/logs`) — the dash's log stream.
- **CLI** (`/cli`) — a command console for the wire protocol, for when you need the raw commands.
- **Firmware** (`/firmware`) — flash a firmware build to the board; the flasher lives here.
- **About** (`/about`) — version and project links.

> [!NOTE]
> The Tuner speaks **Web Serial** over USB — it needs a Chromium-based browser and a wired connection. Bluetooth is the mobile app's job; see [Pairing over BLE](https://github.com/CANShift/canshift-mobile/blob/main/docs/pairing.md).

## No car? Use the simulator

Every tab works against the built-in simulator, so you can lay out a dashboard and watch signals move without a device connected. The [Live data](configure/live-data.md) source badge tells you whether you're looking at **sim** or **live** values.
