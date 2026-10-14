import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants, gzipSync } from 'node:zlib'
import { GZIP_SUFFIX, WEB_ONLY_FILES, bundleEntries } from './dash-bundle-rules'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const OUT = join(ROOT, 'dist-tuner')
const BYTES_PER_KB = 1024

const gzipInto = (name: string): number => {
  const packed = gzipSync(readFileSync(join(DIST, name)), { level: constants.Z_BEST_COMPRESSION })
  writeFileSync(join(OUT, `${name}${GZIP_SUFFIX}`), packed)
  return packed.byteLength
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT)
const files = bundleEntries(DIST).filter((name) => !WEB_ONLY_FILES.has(name))
const totalBytes = files.reduce((sum, name) => sum + gzipInto(name), 0)

console.log(
  `[pack-dash-bundle] ${String(files.length)} files, ${String(Math.round(totalBytes / BYTES_PER_KB))} KB gzipped → dist-tuner/ (copy into the firmware's data/tuner/)`
)
