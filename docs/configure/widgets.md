# Gauges & pages

Everything here happens in **Gauges** (`/gauges`). The screen itself is described in [Gauges](../layout-editor.md).

## Pages

- **Add page** offers **Build from my car**, **Start from a layout**, a ready arrangement of gauges, or **Blank page**.
- **Build from my car** proposes ready pages made only from your car's signals: **Street** (speed, gear, engine speed, temperatures, oil, battery, fuel), **Track** (shift light, gear, lap time and the fast engine signals) and **Engine** (temperatures and pressures). While the tuner is connected to the dash, it uses only the signals actually coming in; otherwise every signal your car defines. A page is offered only when the car has enough signals for it, and a slot the car cannot fill is left out, its neighbours taking the room. Each proposal shows the page as the dash will draw it; tick one or several, then **Add**. The pages land in the draft like any other edit, and only as many as still fit on the dash can be ticked.
- A page's menu moves it **earlier** or **later**, or removes it.
- **Make it a cruise control page** turns the page into the dash's cruise control page; **Make it a gauges page** turns it back. See [Cruise control](https://github.com/CANShift/canshift-firmware/blob/main/docs/guide/cruise-control.md) for what the dash shows there.
- The chip order is the order you swipe through on the dash.

## Widgets

**Add** offers every widget type: a gauge, a button, a gear indicator or a shift light. The tuner places it in the page's free space while the page has room; the editor says how many places are used.

To set one up:

1. Tap it on the preview.
2. In **Shows**, pick the signal. The picker lists your [car's signals](ecu-profiles.md) with their live values, so you can see the one you want moving.
3. Set **Name on dash** (up to 8 letters).
4. Set **Limits** if it needs them.
5. Open **More options** for the rest: the type, the size, the widget's own settings (a gauge's range, style and decimals; a button's actions and colours; shift-light and timer settings), its colours and its day-mode text colour.

**Move left** and **Move right** change its position, **Remove gauge** takes it off after a confirmation.

## Limits and the full-screen alert

Two different cues, kept visually apart on purpose:

| Cue                   | Where you set it             | What the dash does                      | Look in the tuner   |
| --------------------- | ---------------------------- | --------------------------------------- | ------------------- |
| **Limits**            | The gauge editor             | Colours that one gauge orange, then red | Outlined orange/red |
| **Full-screen alert** | **Dash → Full-screen alert** | Takes over the whole screen             | Solid red           |

Limits go **above** or **below** a value: a coolant temperature warns when high, an oil pressure when low. When a gauge shows the alert signal, the editor shows a solid red link to the alert under **Dash**.

## Previewing the dash's states

**Preview: Normal · Cut · Splash · Alert**, under the preview, shows how the page looks when the dash is not just showing values:

| Mode       | What the preview shows                        |
| ---------- | --------------------------------------------- |
| **Normal** | The page as it renders                        |
| **Cut**    | A protection cut, banded under the status row |
| **Splash** | A driver-requested function taking the screen |
| **Alert**  | The critical-alert takeover                   |

## Sending

Every edit is kept in this browser right away. Tap **Send to dash** to put it on the dash, which reloads without a restart. If the dash refuses, the reason shows in plain words with **Show me**; see [Send errors](burn-errors.md) for what the dash itself reports.
