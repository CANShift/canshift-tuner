# Boot diagnostics

If the dash flashes successfully but never reaches the dashboard, the boot logs
on the USB serial line tell you which stage failed. Open a serial monitor at
**115200 baud** before powering the device.

## Reading the splash progress bar

The splash bar advances through known stages:

| Bar progress | Stage                            | If it stops here                                                |
| -----------: | -------------------------------- | --------------------------------------------------------------- |
|         10 % | "Config loaded"                  | SPIFFS mount or JSON parse — check the `[BOOT]` line just above |
|         40 % | "Applying config…"               | Schema mismatch or out-of-range values                          |
|         60 % | "Starting runtime…"              | Signal store / timer / track / alert init failed                |
|         78 % | "CAN ready" or "CAN unavailable" | TWAI install — wiring or transceiver issue                      |
|         90 % | "USB ready"                      | USB rxBuf allocation failed at boot                             |
|        100 % | "Ready"                          | Should advance to the dashboard within ~2 s                     |

## "[BOOT] Ready" never prints

The CI smoke test asserts that `[BOOT] Ready` appears exactly once. If you
never see it:

- Look for `[HEAP]` lines just before the failure — a `largest=` value below
  ~10 KB means heap fragmentation hit one of the early reservations. Heap
  ordering is documented in [Boot sequence](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/boot-sequence.md).
- Look for `[BLE]` or `[CAN]` errors — those subsystems tolerate failure and
  let boot continue, so seeing them does **not** mean boot is stuck.

## Common boot-time errors in ErrorBar

Once the dash boots far enough to show the UI, the ErrorBar (red strip at the
bottom of the screen) surfaces problems. The codes you'll see most often:

| Code         | Meaning                                                                           | Fix                                                       |
| ------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `MOUNT_FAIL` | SPIFFS mount failed                                                               | Re-flash; if persistent, the flash partition is corrupt   |
| `VER_MAJOR`  | `dashboard.json` was written for another major schema; the dash loads what it can | Send to dash again from the tuner                         |
| `VER_OLD`    | `dashboard.json` predates grid layouts (schema 1.25); the gauges stack up         | Send to dash again from the tuner                         |
| `READ_FAIL`  | A config file and its `.bak` both fail to read or parse                           | Send to dash again                                        |
| `CFG_BAK`    | The dash refused the new `dashboard.json` and went back to the previous one       | Check that every gauge fits on its page, then send again  |
| `BOOT_FAIL`  | TWAI driver init failed (CAN)                                                     | Check CAN wiring, ECU termination                         |
| `FONT_WRITE` | A built-in font could not be written to SPIFFS at boot                            | Reboot; if it persists, re-flash the filesystem partition |

Firmware 0.20 and older name two of these differently, `VER_MISMATCH` for
`VER_MAJOR` and `FONT_PROVISION_FAIL` for `FONT_WRITE`, and never report
`VER_OLD` or `CFG_BAK`.

> [!TIP]
> **The ErrorBar swipes up**
>
> Swipe up from the red strip to expand the full error list. Dismiss individual rows with the
> per-row × button.

## Nothing on screen at all

If the dash is powered but the display stays black:

- Confirm the USB cable is wired for data, not just power.
- Check the SPI wiring — particularly `TFT_DC=2` and `TFT_CS=15`.
- Try `pio device monitor` from a fresh PlatformIO env to see if the firmware
  is actually running (boot logs print regardless of the panel).

If logs print but the panel is dark, the issue is at the LovyanGFX layer.
Capture the boot log and open an issue.

## Capturing boot logs for an issue

```bash
pio device monitor --baud 115200 --port /dev/cu.usbserial-XYZ \
  --filter time --filter colorize > boot.log
```

Then power the dash. Paste the file into the GitHub issue — boot logs almost
always contain the exact failure point.
