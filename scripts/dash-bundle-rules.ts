import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CURRENT_SCHEMA_VERSION } from '@canshift/core'

export const SPIFFS_NAME_LIMIT = 24
export const GZIP_SUFFIX = '.gz'
export const MANIFEST_NAME = 'manifest.json'

export interface BundleManifest {
  tuner_version: string
  core_version: string
  schema_version: string
}

const INLINE_CODE: readonly { pattern: RegExp; problem: string }[] = [
  { pattern: /<script(?![^>]*\ssrc=)[^>]*>/i, problem: 'an inline <script>' },
  { pattern: /<style[\s>]/i, problem: 'an inline <style>' },
  { pattern: /\sstyle="/i, problem: 'an inline style attribute' },
]

export const bundleEntries = (dir: string): string[] => readdirSync(dir)

export const nestedEntries = (dir: string): string[] =>
  bundleEntries(dir).filter((name) => statSync(join(dir, name)).isDirectory())

export const overlongNames = (names: readonly string[]): string[] =>
  names.filter((name) => `${name}${GZIP_SUFFIX}`.length > SPIFFS_NAME_LIMIT)

export const inlineCodeIn = (html: string): string[] =>
  INLINE_CODE.filter(({ pattern }) => pattern.test(html)).map(({ problem }) => problem)

export const bundleManifest = (tunerVersion: string, coreVersion: string): BundleManifest => ({
  tuner_version: tunerVersion,
  core_version: coreVersion,
  schema_version: CURRENT_SCHEMA_VERSION,
})

export const reservedNameClashes = (names: readonly string[]): string[] =>
  names.filter((name) => name === MANIFEST_NAME)
