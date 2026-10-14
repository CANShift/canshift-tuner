import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export const SPIFFS_NAME_LIMIT = 24
export const GZIP_SUFFIX = '.gz'
export const WEB_ONLY_FILES = new Set([
  '_headers',
  'robots.txt',
  'sitemap.xml',
  'og-image-1200x630.png',
])

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
