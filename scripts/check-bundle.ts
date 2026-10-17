import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GZIP_SUFFIX,
  MANIFEST_NAME,
  SPIFFS_NAME_LIMIT,
  bundleEntries,
  inlineCodeIn,
  nestedEntries,
  overlongNames,
  reservedNameClashes,
} from './dash-bundle-rules'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const problems = [
  ...nestedEntries(DIST).map((name) => `${name}/ is a directory; the dash bundle must be flat`),
  ...overlongNames(bundleEntries(DIST)).map(
    (name) => `${name}${GZIP_SUFFIX} is longer than ${String(SPIFFS_NAME_LIMIT)} characters`
  ),
  ...reservedNameClashes(bundleEntries(DIST)).map(
    (name) => `${name} in dist/ would overwrite the bundle manifest ${MANIFEST_NAME}${GZIP_SUFFIX}`
  ),
  ...inlineCodeIn(readFileSync(join(DIST, 'index.html'), 'utf8')).map(
    (problem) => `index.html has ${problem}, which the dash's CSP blocks`
  ),
]

if (problems.length > 0) {
  for (const problem of problems) console.error(`[check-bundle] ${problem}`)
  process.exit(1)
}

console.log(
  `[check-bundle] ${String(bundleEntries(DIST).length)} files, flat, names fit SPIFFS, no inline code`
)
