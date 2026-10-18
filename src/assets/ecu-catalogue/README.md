# Bundled ECU XML catalogue

Source: CAN XML description files collected by janimm on GitHub
License: Unlicense (public domain)
Fetched: 2026-06-10

The XML files in this directory are vendored copies of that collection. Vendor
folders are renamed to snake_case for URL safety; original filenames preserved.
Comments naming the original dash app are removed and the root element is
`<CanXml version="2">`; the frame and value markup is unchanged.

`index.json` lists every entry with `{ vendor, file, label, path, sizeBytes }`
so the tuner UI can render a searchable / sortable catalogue without an
extra fetch round-trip.
