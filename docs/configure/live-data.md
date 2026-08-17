# Live data

The **Live data** tab (`canshift-tuner/src/routes/LiveDataRoute.tsx`) lists every signal in the active profile with its current value, so you can confirm a binding is working without looking at the dash.

## Where the numbers come from

A badge next to the signal count tells you the source (`components/live-data/SourceBadge.tsx`):

- **live** — a device is connected over Web Serial and streaming real frames,
- **sim** — the built-in simulator is driving the values,
- **none** — nothing is connected, so the values hold at their last state.

## Reading the table

Each row shows the signal **name**, its **value**, **unit**, and the **min / max** from the profile. A value at or above 90% of its max is flagged — a quick way to spot a signal that's redlining or mis-scaled. Filter the list by typing part of a name or a unit.

> [!TIP]
> Use Live data to validate an [ECU profile](../configure/ecu-profiles.md) before you place a single widget: apply the profile, drive the simulator or the car, and check the signals move the way you expect.

## Export

**Export** writes the current signals to a CSV named `canshift-live-<timestamp>.csv`, with the columns `name, value, unit, min, max` — handy for filing a bug or comparing two profiles offline.
