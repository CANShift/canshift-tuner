import { describe, expect, it } from 'vitest'
import { swipeIntent } from './swipe-intent'

const CLOSED = { diagOpen: false, settingsOpen: false }
const DIAG = { diagOpen: true, settingsOpen: false }
const SETTINGS = { diagOpen: false, settingsOpen: true }

describe('swipeIntent vertical', () => {
  it('opens diagnostics on a swipe up with nothing open', () => {
    expect(swipeIntent({ dx: 0, dy: -40 }, CLOSED)).toBe('open-diag')
  })

  it('closes diagnostics on a swipe down', () => {
    expect(swipeIntent({ dx: 0, dy: 40 }, DIAG)).toBe('close-diag')
  })

  it('ignores a swipe up over the settings panel', () => {
    expect(swipeIntent({ dx: 0, dy: -40 }, SETTINGS)).toBe('none')
  })
})

describe('swipeIntent horizontal', () => {
  it('pages forward on a swipe left and back on a swipe right', () => {
    expect(swipeIntent({ dx: -60, dy: 5 }, CLOSED)).toBe('next-page')
    expect(swipeIntent({ dx: 60, dy: 5 }, CLOSED)).toBe('previous-page')
  })

  it('ignores short or slanted swipes', () => {
    expect(swipeIntent({ dx: -30, dy: 0 }, CLOSED)).toBe('none')
    expect(swipeIntent({ dx: -60, dy: 25 }, CLOSED)).toBe('none')
  })

  it('does not page while an overlay is open', () => {
    expect(swipeIntent({ dx: -60, dy: 0 }, DIAG)).toBe('none')
  })
})
