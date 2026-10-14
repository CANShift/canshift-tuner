# canshift-tuner

Web configurator for CANShift dashes. Served by the dash itself in workshop mode and
talking to it over a **WebSocket** on the dash's Wi-Fi; on a desktop Chromium browser it can
also talk **WebSerial** over USB. A copy is hosted on Cloudflare Workers at canshift.app.

📖 **[Documentation](docs/README.md)** — configuring, and a tour of every tab.

## Why this package

`canshift-tuner` is the configurator surface for CANShift dashes.

- Offline by construction — the bundle carries its fonts and ECU catalogue, so it runs from the
  dash's access point with no internet.
- One protocol, two links — the same newline-delimited JSON commands go over a WebSocket
  (`ws://<dash>/ws`) or WebSerial; `src/lib/transport-choice.ts` picks the link.
- Three tabs — Dash (canvas and widgets), Vehicle (ECU profile, signals, live values), Device (board, units, backup).

## Editor highlights

- Drag-to-bind: the Signals panel (inspector) is fed by the live CAN scan —
  drag a signal onto the canvas to create a bound widget, onto an existing
  widget to rebind it, or a Library widget onto a signal row.
- 100-step undo/redo (`⌘Z` / `⇧⌘Z`) with a labelled History panel; autosave
  to local storage restores the exact canvas (selection included) on reload.
- One config at a time — pages + widgets + ECU profile + theme + target panel
  back up and restore as one `.canshift` file; the CAN scan and Learn mode keep
  running across tabs.
- Burn gate — unbound widgets render the device's `--` placeholder, are
  counted in the toolbar, and prompt once before burning.

## Dev

```bash
npm install    # @canshift/core comes from npm
npm run dev          # vite — http://localhost:5173 (simulation mode without a device)
npm run typecheck
npm run test         # vitest
npm run lint
npm run format:check # enforced in CI
npm run build
```

To develop against a dash (or a mock) over WebSocket, point the dev server at it with
`?dash=<host[:port]>` in the URL or `VITE_DASH_HOST=<host[:port]>` in the environment.
Without either, `localhost` uses WebSerial.

No board? Run the mock dash in a second terminal and open the tuner against it:

```bash
npm run mock-dash   # ws://localhost:8787/ws (MOCK_DASH_PORT to change it)
npm run dev         # then open http://localhost:5173/?dash=localhost:8787
```

The mock answers the version handshake, ping, config read and chunked burn, the device
config (CAN bus speed, which reboots it like the real dash), day/night and the other
commands, and streams telemetry, heap and CAN-rate frames. It keeps its state in memory
until you stop it.

## Browser requirements

- Served by the dash: any current browser, phones included.
- On localhost or canshift.app: WebSerial, so Chrome / Edge / Brave / Opera 89+ on a desktop.
  Elsewhere the connect panel explains how to reach the dash and still offers Edit offline.
