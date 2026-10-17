import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants, gzipSync } from 'node:zlib'
import * as z from 'zod'
import { GZIP_SUFFIX, MANIFEST_NAME, bundleEntries, bundleManifest } from './dash-bundle-rules'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const OUT = join(ROOT, 'dist-tuner')
const BYTES_PER_KB = 1024

const CORE_PACKAGE = join(ROOT, 'node_modules', '@canshift', 'core', 'package.json')
const PackageVersion = z.object({ version: z.string() })

const versionOf = (packageJson: string): string =>
  PackageVersion.parse(JSON.parse(readFileSync(packageJson, 'utf8'))).version

const gzipWrite = (name: string, content: Buffer): number => {
  const packed = gzipSync(content, { level: constants.Z_BEST_COMPRESSION })
  writeFileSync(join(OUT, `${name}${GZIP_SUFFIX}`), packed)
  return packed.byteLength
}

const manifestContent = (): Buffer => {
  const manifest = bundleManifest(versionOf(join(ROOT, 'package.json')), versionOf(CORE_PACKAGE))
  return Buffer.from(`${JSON.stringify(manifest)}\n`)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT)
const files = bundleEntries(DIST)
const assetBytes = files.reduce(
  (sum, name) => sum + gzipWrite(name, readFileSync(join(DIST, name))),
  0
)
const totalBytes = assetBytes + gzipWrite(MANIFEST_NAME, manifestContent())

console.log(
  `[pack-dash-bundle] ${String(files.length + 1)} files, ${String(Math.round(totalBytes / BYTES_PER_KB))} KB gzipped → dist-tuner/ (copy into the firmware's data/tuner/)`
)
