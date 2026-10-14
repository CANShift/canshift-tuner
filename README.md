# canshift-tuner

Web configurator for CANShift dashes. Served by the dash itself in workshop mode and
talking to it over a **WebSocket** on the dash's Wi-Fi; on a desktop Chromium browser it can
also talk **WebSerial** over USB. There is no hosted copy: the dash is the only place it is served.

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
npm run build        # also checks the bundle fits the dash (see below)
npm run bundle:dash  # build + gzip into dist-tuner/, ready for the firmware's data/tuner/
```

The dash serves this bundle from SPIFFS under `/tuner/`, where a full path is at most 31
characters, behind a `default-src 'self'` CSP. So the build emits flat, hashed names
(`[hash:10].js` at the bundle root, no `assets/` folder) and `npm run build` fails when any
file name with `.gz` passes 24 characters, when `dist/` holds a folder, or when `index.html`
carries an inline script, style block or style attribute. Fonts and the ECU catalogue are part
of the bundle; zod runs jitless (`src/lib/strict-csp.ts`, chunked with zod so it applies before
the schemas build) so it never probes `new Function`.

To develop against a dash (or a mock) over WebSocket, point the dev server at it with
`?dash=<host[:port]>` in the URL or `VITE_DASH_HOST=<host[:port]>` in the environment.
Without either, `localhost` uses WebSerial.

No board? Run the mock dash in a second terminal and open the tuner against it:

```bash
npm run mock-dash   # ws://localhost:8787/ws (MOCK_DASH_PORT to change it)
npm run dev         # then open http://localhost:5173/?dash=localhost:8787
```

The mock answers the version handshake, ping, config read and chunked burn, the device
config (CAN bus speed, which reboots it like the real dash), firmware updates (it checks the
image, the offsets, the SHA-256 and the Ed25519 signature, then reboots reporting the new
version), day/night and the other commands, and streams telemetry, heap and CAN-rate frames. It
keeps its state in memory until you stop it.

The mock verifies signatures against a throwaway key it generates on every start, never the
release key. Sign a test image with it while it runs: `npm run mock-dash:sign -- <firmware.bin>`
writes `<firmware.bin>.sig` beside it.

## Releasing the dash bundle

The firmware pins a tuner release by tag and SHA-256 and copies its files into `data/tuner/`.
The archive is a contract: `canshift-tuner-dash-vX.Y.Z.tar.gz` holds only flat `.gz` files at its
root (no folders), and `canshift-tuner-dash-vX.Y.Z.tar.gz.sha256` sits beside it. Tell the
firmware side before changing either.

1. Bump `version` in `package.json` in a PR and merge it. That version is the release.
2. Tag the merge commit and push the tag:
   `git tag "v$(node -p "require('./package.json').version")" && git push origin --tags`
3. The `release` workflow checks the tag matches `package.json`, runs `npm run bundle:dash`,
   packs the archive, and drafts a GitHub Release with both files attached.
4. Rewrite the draft's notes before publishing: what changed for someone using the tuner on
   the dash, and anything the firmware pin must know. GitHub Releases is the public changelog.
5. Publish, then pin the tag and the SHA-256 from the `.sha256` file in the firmware.

- Served by the dash: any current browser, phones included.
- On localhost (`npm run dev`): WebSerial, so Chrome / Edge / Brave / Opera 89+ on a desktop.
  Elsewhere the connect panel explains how to reach the dash and still offers Edit offline.
