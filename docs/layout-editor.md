# Gauges

**Gauges** (`/gauges`) is where you decide what the dash shows: its pages, the widgets on each page, and what each one reads and how it looks. For the workflow end to end, read [Gauges & pages](configure/widgets.md).

## The screen

- **Page chips** along the top, one per page, plus **Add page**. Each page's menu offers **Move earlier**, **Move later**, **Remove page**, and **Make it a cruise control page** (or **Make it a gauges page** to turn it back).
- **The dash preview** draws the selected page as the dash renders it: 1× on a phone, 2× on a laptop. Tap a widget to edit it; a ring marks the selection.
- **Preview: Normal · Cut · Splash · Alert**, under the preview, shows the page as it renders, with a protection cut banded under the status row, with a splash taking the screen, or under the critical-alert takeover.
- **Add** opens **Add to this page**: pick a gauge, a button, a gear indicator or a shift light, and the tuner places it in the page's free space.
- **The gauge editor** opens as a sheet on a phone and as a side panel on a laptop.

## The gauge editor

| Field            | What it does                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **Shows**        | The signal the gauge reads. The picker searches your car's signals and shows each one's live value. |
| **Name on dash** | The label on the gauge, up to 8 letters.                                                            |
| **Limits**       | **Warning** and **Danger**, above or below a value, or **No limit**. They colour this gauge only.   |

**More options** opens the rest of the widget:

| Option                | What it does                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **Type**              | Gauge, button, gear indicator or shift light.                                                        |
| Size                  | How much of the page the widget takes.                                                               |
| The widget's settings | A gauge's range, style and decimals; a button's actions and colours; shift-light and timer settings. |
| Colours               | The widget's own colours.                                                                            |
| Day-mode text colour  | The text colour the widget uses when the dash is in day mode.                                        |

Below the fields: **Move left**, **Move right** and **Remove gauge** (it asks first).

Limits are outlined in orange and red. When the gauge shows the signal that drives the [full-screen alert](configure/widgets.md#limits-and-the-full-screen-alert), a solid red row says so and links to it under **Dash**.

> [!NOTE]
> The tuner holds you inside the firmware's limits on pages and widgets, so a setup that edits here is one the dash can build. See [LVGL ownership](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/lvgl-ownership.md) for why the limits exist.

## Not on the canvas

Widgets are not dragged, resized, aligned or copy-pasted on the preview. **Add** places a widget, **Size** sets its size and **Move left** / **Move right** set its order.

## On a laptop

The arrow keys move the selection to the widget before or after. **Esc** closes the editor.
