# Live data

Live values sit in the signal table on **Vehicle → Signals** (`canshift-tuner/src/components/signals/SignalsWorkspace.tsx`): every signal in the active profile shows its current value next to its unit, so you can confirm a binding works without looking at the dash.

## Where the numbers come from

- A dash connected over Wi-Fi or USB streams the real decoded values.
- In simulation (**Edit offline**) the built-in simulator drives them, and the red strip under the header says so.
- If the dash is connected but the bus is silent, a notice above the table says how long no frame has arrived.

## The plot

Tick a signal's box to draw it on the live plot: beside the table from 1100 px wide, above it on narrower screens. The first three used signals start ticked. Each line is scaled to its own range; the legend gives each signal's minimum and maximum over the window.

The end of the toolbar holds the time window (`−` / `+`, 5 to 120 s), **Pause**, which freezes the values and the plot, and **Record**.

## Recording

**Record** samples every signal until you press **Stop & save**, then downloads a CSV named `canshift-live-<timestamp>.csv`, in the unit system the tuner is set to.

> [!TIP]
> Use live data to validate an [ECU profile](../configure/ecu-profiles.md) before you place a single widget: apply the profile, drive the simulator or the car, and check the signals move the way you expect.
