import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LiveDataSkeleton } from './LiveDataSkeleton'

const ROW_MARKER = 'items-center gap-[14px]'

const render = (signalNames: string[]): string =>
  renderToStaticMarkup(<LiveDataSkeleton signalNames={signalNames} />)

const countRows = (markup: string): number => markup.split(ROW_MARKER).length - 1

describe('LiveDataSkeleton', () => {
  it('renders one row per bound signal so the panel keeps its height', () => {
    expect(countRows(render(['rpm', 'coolant_temp', 'oil_pressure_front']))).toBe(3)
    expect(countRows(render(['rpm']))).toBe(1)
    expect(countRows(render([]))).toBe(0)
  })

  it('sizes the label block from the signal name length', () => {
    expect(render(['rpm'])).toContain('w-[64px]')
    expect(render(['coolant_temp'])).toContain('w-[88px]')
    expect(render(['oil_pressure_front'])).toContain('w-[104px]')
  })

  it('announces listening with no spinner and no animation', () => {
    const markup = render(['rpm', 'coolant_temp'])
    expect(markup).toContain('LIVE DATA')
    expect(markup).toContain('LISTENING…')
    expect(markup).not.toMatch(/animate-|shimmer|<svg/i)
  })
})
