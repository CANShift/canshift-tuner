# Layout editor

The **Editor** tab (`/dashboard`, `canshift-tuner/src/routes/EditorRoute.tsx`) is where the dashboard is drawn. Three regions: a strip of pages down one side, the widget canvas in the middle, and a property panel on the right for whatever is selected.

This page is the tool overview. For the step-by-step — adding pages, binding widgets to signals, saving and burning — read [Widgets & pages](configure/widgets.md).

## What you work with

- **Pages** — the page strip adds, duplicates, reorders and deletes pages, and sets which one the dash boots to.
- **Widgets** — dropped onto the canvas and bound to a signal from the active [ECU profile](configure/ecu-profiles.md). The type list (label, gauge, gear, shift light, warning, timer, and the rest) is the same set the firmware renders.
- **Properties** — the right-hand panel edits the selected widget's binding, range and colours.

> [!NOTE]
> The editor holds you inside `FIRMWARE_CAPS` from `@canshift/core` — the runtime ceilings on pages, widgets and layout. A dashboard that saves here is one the dash can actually build; see [LVGL ownership](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/lvgl-ownership.md) for why the limits exist.
> Everything stays in the browser until you burn it to the dash, which reloads without a re-flash.
