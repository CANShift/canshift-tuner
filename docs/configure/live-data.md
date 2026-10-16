# Live data

Live values show in three places: the **Signals** list and the **Live plot** in **Car**, and the signal picker in the gauge editor. All of them let you confirm a signal moves before you put it on a gauge. The live plot draws the signals you choose over time, and can pause or record them; see [Your car](ecu-profiles.md#signals-and-the-live-plot).

## Where the numbers come from

- A dash connected over Wi-Fi or USB streams the real decoded values.
- With **Keep editing** on the **Not connected** screen, the built-in simulator drives them.
- While the tuner is reconnecting, live values pause. Editing keeps working.

## No data

A signal that receives nothing reads **No data** and moves to the top of the list. Check the wiring, then the **CAN bus speed** under **Dash**: it must match the car, and most cars use 500 kbit/s. If the dash is connected but the whole bus is silent, a notice above the list says how long no frame has arrived.

A value that arrives but looks wrong is a scaling problem: fix it with [Adjust reading](ecu-profiles.md#adjust-reading). A signal the catalogue doesn't know starts in **Car → More → Raw CAN frames** ([More](ecu-profiles.md#more)). A car that only answers OBD-II requests reads nothing until you set up OBD-II polling there.

> [!TIP]
> Validate your car before you place a single gauge: choose it, drive the simulator or the car, and check the signals move the way you expect.
