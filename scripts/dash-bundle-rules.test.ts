import { describe, expect, it } from 'vitest'
import { inlineCodeIn, overlongNames } from './dash-bundle-rules'

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
