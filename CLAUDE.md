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
- Observability: PostHog lives behind env (`VITE_POSTHOG_KEY`); scrub car data (payloads, frame ids, names) from anything sent; opt-out must keep working.
- Flasher reads releases from CANShift/canshift-firmware.

## Workflow

- Branch `type/short-description`; Conventional Commits, subject only.
- PR via `gh pr create`; required checks `lint`, `typecheck`, `test`, `build`; **rebase and merge only**.
- Deploys: Vercel Git integration — preview per PR, production on main. Env changes need a redeploy.
