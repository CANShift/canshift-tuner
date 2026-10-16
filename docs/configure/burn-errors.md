# Send errors

When you tap **Send to dash** in the tuner, the dash shows a "Saving config…" overlay
while it writes to SPIFFS. If the write fails, the overlay turns red and shows
one of the messages below.

These are failures on the dash itself. A setup the dash refuses before writing
(a missing signal, a full page) shows in the tuner instead, in plain words with
**Show me**.

## "Storage write failed"

The atomic SPIFFS write failed — typically because the flash is nearly full or
fragmented. The previous config (`.bak`) is still in place; the dash re-loads
the old config on the next boot, so you keep what you had.

**Recovery:**

1. Reboot the dash.
2. Open `pio device monitor` to confirm `[BOOT] Ready` prints normally.
3. Send to dash again — transient SPIFFS errors usually resolve.
4. If it keeps failing, the SPIFFS partition may be corrupt. Re-flash the
   filesystem image: `pio run -t uploadfs`.

## "Config reload failed"

The write succeeded but the dash couldn't parse the new file. The tuner sent
invalid JSON, or the schema version doesn't match the firmware.

The dash falls back to the built-in default config and surfaces
`SCHEMA_MISMATCH` (or similar) in the ErrorBar.

**Recovery:**

- Reload the tuner page and send again — the tuner always writes the schema of
  the `@canshift/core` it was built with.
- If the issue persists, update the dash to the firmware that matches your
  tuner. The schema version is logged at boot: `[BOOT] Schema vN.M`.

> [!WARNING]
> **Stop the frame scan before sending over USB**
>
> Over USB, a running frame scan keeps the link busy, and a send in the middle of it can time
> out. Stop the scan in **Car → More → Raw CAN frames** first, then send.

## The overlay clears but the dash didn't reload

If the overlay disappears (success) but the new gauges don't appear, the
page rebuild missed the reload. Reboot the dash — the new config is on disk
and loads on the next boot.

This shouldn't happen in normal operation; if it does, capture the boot log
and open an issue.

## Out of memory while saving

A very large `dashboard.json` plus a fragmented heap can make the save run out
of memory. Symptoms:

- The overlay shows "Storage write failed".
- `[USB]` logs contain `out_of_memory` or `parse_error`.

**Recovery:** simplify the setup (fewer pages, fewer gauges per page) and send
again. The tuner refuses a setup too large for the dash before sending it.
