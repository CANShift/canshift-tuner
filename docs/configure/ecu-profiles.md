# ECU profiles

A profile is the signal set the dash decodes: the CAN frame IDs, bit layouts, scales and units that turn raw bus traffic into `rpm`, `coolant_temp`, and the rest. The Tuner's **ECU** tab (`canshift-tuner/src/routes/EcuRoute.tsx`) is where you pick one.

## Two ways in

- **The catalogue.** The Tuner ships a browsable list of vendor definitions, loaded from `/ecu-catalogue/index.json` (`components/ecu/EcuCatalogueList.tsx`). Search by vendor or label, sort the list, and click an entry to preview it.
- **Your own XML.** Drop a CAN definition file onto the import zone (`components/ecu/XmlImportZone.tsx`). Both paths run the file through `parseCanXml` from `@canshift/core`, so a catalogue entry and a hand-rolled file are validated the same way.

## Preview before you apply

Selecting a source shows its signals in a table (`components/ecu/SignalPreviewTable.tsx`) rather than applying them straight away. The table marks which signals are already **bound** to a widget on one of your pages, so you can see at a glance whether switching profiles will leave a gauge without its signal.

> [!NOTE]
> Parsing surfaces warnings without blocking. A file with a few unreadable rows still loads the signals it could read, and the warnings show above the preview. A file that yields **zero** signals is rejected outright, with the first warning as the reason.

## Applying

**Apply** opens a confirmation (`components/ecu/ApplyConfirmDialog.tsx`) and then swaps the active signal set. Bindings are by signal name, so a widget bound to a signal the new profile doesn't define keeps its binding — the value simply reads stale until a matching signal arrives.

> [!WARNING]
> Applying a profile changes what every widget decodes, not just what the CAN scan shows. If a gauge goes blank after a profile switch, the signal it was bound to is missing from the new set — rebind it in the [editor](../configure/widgets.md), or pick a profile that defines it. Confirm on the [Live data](../configure/live-data.md) tab.
