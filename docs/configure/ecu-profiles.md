# Your car

**Car** (`/car`) holds what the car sends: your car or ECU, and the signals the dash decodes from its CAN bus.

## Choose your car

The tuner carries a catalogue of cars and ECUs in the app itself, so it works with no internet. **Choose your car** (or **Change** once one is set) opens the list; search by make or ECU and pick **Use this car**.

Gauges pick signals by name. When you change car, a gauge whose signal the new car doesn't send has nothing to show; if you send it anyway, the dash refuses and **Show me** points at that gauge.

## Signals and the live plot

The **Signals** list shows each signal with its live value. Signals with **No data** come first: check the wiring and the CAN bus speed (under **Dash**). See [Live data](live-data.md).

The **Live plot** sits next to the list. Tap signals to draw them over time; **Pause** freezes the plot, **Record** captures the values until **Stop & save** downloads them as a CSV file, and the window buttons make the time span longer or shorter.

## Adjust reading

Tap a signal whose value looks wrong to open **Adjust reading**:

- **From the car** is the raw value arriving now; **Shown on dash** is the value after your adjustment, with what it was before.
- **Multiply by**, then **Then add**, and the **Unit**.
- **Reset to catalogue value** puts the catalogue's numbers back.

Compare with a gauge you trust, engine running, and change one number at a time.

## More

The **More** row holds the tools most setups never need:

| Tool                                 | What it does                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **OBD-II polling and trouble codes** | For cars that answer OBD-II requests instead of broadcasting: choose what to poll, read and clear codes. |
| **Profile file (XML)**               | **Import XML…** loads a CAN profile; **Download XML** saves this car as one.                             |
| **Raw CAN frames**                   | Every frame on the bus (`/car/frames`). Use it to map a signal the catalogue doesn't know.               |

## Sending the car to the dash

The car's signals are part of the draft like any other edit: the catalogue choice, the adjusted readings and the OBD-II polling. **Send to dash** writes them to the dash as `/config/signals.json`, and the dash restarts to use them. If the dash can't use them, nothing changes on it and the tuner says so.
