# canshift-tuner — Project Rules

Browser configurator for CANShift dashes (org: github.com/CANShift). Vite + React 18 + TypeScript + Zustand/immer + Tailwind. Talks WebSerial (CH340 UART); built-in esptool-js flasher.

## Commands

- `npm run dev` — vite on :5173, simulation mode without a device
- `npm run typecheck` / `test` (vitest) / `lint` / `format:check` / `build`

## Rules

- `@canshift/core` comes from npm — schema/widget-metric changes land there first, get published, then bump here.
- Design authority: firmware visuals are canonical, the canvas preview mirrors them (shared metrics in core `widget-metrics.ts`); tuner label-handling is canonical the other way.
- Components live under `src/components/<area>/` with a props interface; check `src/components/ui/` (shadcn) before writing bespoke UI. Arrow functions, no comments, no nested ifs.
- Zero comments policy; TS strict; wire-format JSON stays snake_case via boundary mappers.
- Never write "RealDash" outside the literal `<RealDashCAN>` parser tag.
- Observability: PostHog lives behind env (`VITE_POSTHOG_KEY`) _and_ behind consent — telemetry is opt-in, so nothing may load or beacon until `isObservabilityEnabled()` is true; scrub car data (payloads, frame ids, names) from anything sent.
- Flasher reads releases from CANShift/canshift-firmware.

## Code shape

Non-negotiable. Reviewed on every PR, ahead of feature count.

- Guard clauses first. Nesting depth 2 max — a third level means extract a named function.
- One `try` per function. Never a `try` inside a `try`, a `catch` or a `finally`. No empty catch, no catch that only logs, no wrapper that rethrows unchanged. Every other `catch` must return a value, set state or recover — if it can only log, it is advisory and goes through the shared `bestEffort` helper, which is the single place a log-only catch is allowed to live (teardown, optional device capabilities, listener isolation).
- Errors are typed — an error class or a discriminated Result union. Transport codes are humanised at the UI boundary; a raw wire code (`ack_timeout`, `read_failed`) must never render to the user.
- Stacked `cond && <X/>`, chained `else if` and `kind === 'a' ? … : kind === 'b' ? …` are a union that lost its type. Use a `Record<Kind, …>` lookup table — `WidgetPreview.tsx` and `widget-editor-panel.tsx` are the reference implementations.
- ~30 lines per function, ~300 per file. Past that, split before adding.
- Third copy gets extracted. Cross-file boilerplate (localStorage access, JSON parsing, error→string) lives in one shared helper under `src/lib/` and is imported, never re-typed. Storage keys come from one `STORAGE_KEYS` map.
- A constant must be read by the code it names. Unimported stores, components and exports get deleted, not kept "for later".
- CI gates must cover every file extension in the repo. A green check that silently skipped files is a broken gate.

## Workflow

- Branch `type/short-description`; Conventional Commits, subject only.
- PR via `gh pr create`; required checks `lint`, `typecheck`, `test`, `build`; **rebase and merge only**.
- Deploys: Vercel Git integration — preview per PR, production on main. Env changes need a redeploy.
