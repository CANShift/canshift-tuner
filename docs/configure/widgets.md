# Widgets & pages

The **Editor** tab (`canshift-tuner/src/routes/EditorRoute.tsx`) is the visual canvas: a strip of pages down one side, a widget canvas in the middle, and a property panel on the right.

## Pages

The page strip (`components/editor/PageStrip.tsx`) manages the ordered set of dash pages. From it you can:

- **Add** a blank page — it starts on a black background,
- **Duplicate** a page, or **reorder** pages by dragging,
- **Set the default** — the page the dash shows on boot,
- **Delete** a page: select it and press **Delete** (or **Backspace**). A deletion raises an **Undo** toast, and the last remaining page can't be deleted.

## Widgets

A widget binds a signal to a way of drawing it. The built-in types include a plain **label**, a **signal** readout, a **gauge**, a **gear** indicator, a **shift light**, a **warning**, a **timer**, and a **separator** for layout — the same set the firmware renders, all defined in `@canshift/core`. Select a widget to edit its binding, range and colours in the right-hand property panel.

> [!NOTE]
> Pages, widgets and their layout are bounded by `FIRMWARE_CAPS` in `@canshift/core` — the same ceilings the dash enforces at runtime, so a layout that saves in the Tuner is one the dash can actually build. See [LVGL ownership](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/lvgl-ownership.md) for why the ceiling exists.

## Binding to a signal

A widget draws nothing until it's bound to a signal from the active [ECU profile](../configure/ecu-profiles.md). Bindings are by signal **name**, so re-applying a profile that keeps the same names leaves your layout intact. Check what a widget is receiving on the [Live data](../configure/live-data.md) tab.

## Saving

Changes live in the Tuner until you burn them to the dash. The config travels as newline-delimited JSON over the wire — see [Config contract](https://github.com/CANShift/canshift-core/blob/main/docs/config-contract.md) — and the dash reloads without a re-flash. If a burn fails, [Burn errors](../configure/burn-errors.md) walks through it.
