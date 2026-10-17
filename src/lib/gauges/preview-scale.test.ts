import { describe, expect, it } from 'vitest'
import { PREVIEW_VERTICAL_CHROME, fitPreviewScale } from './preview-scale'

const SCREEN = { width: 320, height: 240 }
const tall = (width: number) => ({ width, height: 4000 })

describe('fitPreviewScale', () => {
  it('takes the largest whole factor that fits the column width', () => {
    expect(fitPreviewScale(tall(648), SCREEN)).toBe(2)
    expect(fitPreviewScale(tall(960), SCREEN)).toBe(3)
    expect(fitPreviewScale(tall(959), SCREEN)).toBe(2)
  })

  it('stops growing once the preview would not fit the window height', () => {
    expect(fitPreviewScale({ width: 1300, height: 800 }, SCREEN)).toBe(2)
    expect(fitPreviewScale({ width: 1300, height: 1000 }, SCREEN)).toBe(3)
    expect(fitPreviewScale({ width: 1300, height: PREVIEW_VERTICAL_CHROME + 960 }, SCREEN)).toBe(4)
  })

  it('never drops below the pixel-for-pixel size', () => {
    expect(fitPreviewScale({ width: 200, height: 100 }, SCREEN)).toBe(1)
  })

  it('scales a wider panel by its own design space', () => {
    expect(fitPreviewScale(tall(1000), { width: 480, height: 320 })).toBe(2)
  })
})
