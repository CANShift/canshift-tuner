import { describe, expect, it } from 'vitest'
import { MAX_PREVIEW_SCALE, PREVIEW_VERTICAL_CHROME, fitPreviewScale } from './preview-scale'

const SCREEN = { width: 320, height: 240 }
const tall = (width: number) => ({ width, height: 4000 })

describe('fitPreviewScale', () => {
  it('takes the largest whole factor that fits the column width', () => {
    expect(fitPreviewScale(tall(648), SCREEN)).toBe(2)
    expect(fitPreviewScale(tall(639), SCREEN)).toBe(1)
  })

  it('stops growing once the preview would not fit the window height', () => {
    expect(fitPreviewScale({ width: 1300, height: PREVIEW_VERTICAL_CHROME + 479 }, SCREEN)).toBe(1)
    expect(fitPreviewScale({ width: 1300, height: PREVIEW_VERTICAL_CHROME + 480 }, SCREEN)).toBe(2)
  })

  it('never grows past twice the design size, however large the window', () => {
    expect(fitPreviewScale({ width: 4000, height: 4000 }, SCREEN)).toBe(MAX_PREVIEW_SCALE)
  })

  it('never drops below the pixel-for-pixel size', () => {
    expect(fitPreviewScale({ width: 200, height: 100 }, SCREEN)).toBe(1)
  })

  it('scales a wider panel by its own design space', () => {
    expect(fitPreviewScale(tall(1000), { width: 480, height: 320 })).toBe(2)
  })
})
