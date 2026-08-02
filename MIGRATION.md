# Migration status (monorepo → CANShift org)

This repo was split from `tburkhalterr/CANShift` with history. Remaining cutover steps:

1. Publish `@canshift/core@1.0.0` from [CANShift/canshift-core](https://github.com/CANShift/canshift-core) (needs the `canshift` npm org + `NPM_TOKEN` secret).
2. `npm install` here to regenerate `package-lock.json` against the published package — CI is red until then (the lockfile still references the monorepo `file:../canshift-core` link).
3. ~~Re-link Vercel~~ DONE — the Vercel Git integration is connected: preview deploys on PRs, production on main. No VERCEL_* secrets or Actions deploy workflow needed.
4. Sentry source maps: set `SENTRY_AUTH_TOKEN` and `VITE_SENTRY_DSN` in the **Vercel project env** (builds run on Vercel via the Git integration) — the vite plugin only activates when the token is present, uploads hidden source maps for `canshift-tuner@<version>`, then deletes the `.map` files from the deploy.
5. Point the flasher release fetch (`src/lib/firmware/releases.ts`) at `CANShift/canshift-firmware` once its first release exists.
6. Transfer `scope:tuner` issues once the monorepo joins the org. ~~Flip public~~ DONE.
