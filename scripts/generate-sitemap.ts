#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_PATHS } from '../src/constants/routes'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(SCRIPT_DIR, '..', 'public', 'sitemap.xml')
const BASE_URL = 'https://canshift.app'

const urlEntry = (path: string): string =>
  `  <url>\n    <loc>${BASE_URL}${path === '/' ? '/' : path}</loc>\n  </url>`

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTE_PATHS.map(urlEntry),
  '</urlset>',
  '',
].join('\n')

writeFileSync(OUTPUT_PATH, sitemap)
console.log(`sitemap: ${String(ROUTE_PATHS.length)} routes -> ${OUTPUT_PATH}`)
