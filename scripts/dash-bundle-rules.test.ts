import { CURRENT_SCHEMA_VERSION } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import {
  GZIP_SUFFIX,
  MANIFEST_NAME,
  SPIFFS_NAME_LIMIT,
  bundleManifest,
  inlineCodeIn,
  overlongNames,
  reservedNameClashes,
} from './dash-bundle-rules'

describe('dash bundle rules', () => {
  it('flags a name that no longer fits under /tuner/ once gzipped', () => {
    expect(
      overlongNames(['Ab12Cd34Ef.js', 'apple-touch-icon.png', 'android-chrome-192.png'])
    ).toEqual(['android-chrome-192.png'])
  })

  it('accepts external scripts and stylesheets', () => {
    const html =
      '<script type="module" crossorigin src="/Ab12Cd34Ef.js"></script><link rel="stylesheet" href="/x.css">'
    expect(inlineCodeIn(html)).toEqual([])
  })

  it('flags inline scripts, style blocks and style attributes', () => {
    expect(inlineCodeIn('<script>alert(1)</script>')).toEqual(['an inline <script>'])
    expect(inlineCodeIn('<style>p{}</style>')).toEqual(['an inline <style>'])
    expect(inlineCodeIn('<div style="color:red">')).toEqual(['an inline style attribute'])
  })
})

describe('dash bundle manifest', () => {
  it('records the tuner, the core package and the schema it was built against', () => {
    expect(bundleManifest('0.2.0', '10.2.0')).toEqual({
      tuner_version: '0.2.0',
      core_version: '10.2.0',
      schema_version: CURRENT_SCHEMA_VERSION,
    })
  })

  it('fits under /tuner/ once gzipped', () => {
    expect(`${MANIFEST_NAME}${GZIP_SUFFIX}`.length).toBeLessThanOrEqual(SPIFFS_NAME_LIMIT)
  })

  it('flags a built asset that would overwrite the manifest', () => {
    expect(reservedNameClashes(['index.html', MANIFEST_NAME])).toEqual([MANIFEST_NAME])
    expect(reservedNameClashes(['index.html', 'site.webmanifest'])).toEqual([])
  })
})
