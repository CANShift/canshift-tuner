import { describe, expect, it } from 'vitest'
import { buttonPathD, centerBox, labelCenter, labelFontSize, quadrants } from './cruise-geometry'

describe('cruise geometry', () => {
  it('splits the content area into four padded quadrants around a centred box', () => {
    const boxes = quadrants(320, 200)
    expect(boxes['top-left']).toEqual({ x: 6, y: 6, w: 152, h: 92 })
    expect(boxes['bottom-right']).toEqual({ x: 162, y: 102, w: 152, h: 92 })
    expect(centerBox(320, 200)).toEqual({ x: 110, y: 62, w: 100, h: 76 })
  })

  it('mirrors the notch towards the centre for each corner', () => {
    expect(buttonPathD(152, 92, 'top-left').startsWith('M 8 0')).toBe(true)
    expect(buttonPathD(152, 92, 'bottom-right').startsWith('M 144 92')).toBe(true)
  })

  it('pulls the label away from the notch', () => {
    expect(labelCenter(152, 92, 'top-left')).toEqual({ x: 62, y: 35 })
    expect(labelCenter(152, 92, 'bottom-right')).toEqual({ x: 90, y: 57 })
  })

  it('draws symbols larger than words', () => {
    expect(labelFontSize('+', 152, 92)).toBeGreaterThan(labelFontSize('SET', 152, 92))
  })
})
