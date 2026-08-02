# Migration status (monorepo → CANShift org)

This repo was split from `tburkhalterr/CANShift` with history. Remaining cutover steps:

1. Publish `@canshift/core@1.0.0` from [CANShift/canshift-core](https://github.com/CANShift/canshift-core) (needs the `canshift` npm org + `NPM_TOKEN` secret).
2. `npm install` here to regenerate `package-lock.json` against the published package — CI is red until then (the lockfile still references the monorepo `file:../canshift-core` link).
3. Re-link the Vercel tuner project to this repo; move `VERCEL_*` secrets; port `deploy-vercel.yml`.
4. Point the flasher release fetch (`src/lib/firmware/releases.ts`) at `CANShift/canshift-firmware` once its first release exists.
5. Transfer `scope:tuner` issues; flip the repo public.
