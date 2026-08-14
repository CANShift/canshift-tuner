import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SignalDef } from '@canshift/core'
import { LiveDataGrid } from './LiveDataGrid'
import { LiveDataSkeleton } from './LiveDataSkeleton'

const CELL_MARKER = 'py-[18px]'
const GRID_MARKER = 'grid-cols-'

const signal = (name: string): SignalDef =>
  ({
    name,
    canFrameId: '0x370',
    startByte: 0,
    byteLength: 2,
    bigEndian: true,
    signed: false,
    scale: 0.1,
    offset: 0,
    unit: '°C',
    min: 0,
    max: 150,
    timeoutMs: 1000,
  }) as SignalDef

const SIGNALS = ['rpm', 'coolant_temp', 'oil_pressure_front'].map(signal)

const classAttributes = (markup: string): string[] =>
  [...markup.matchAll(/class="([^"]*)"/g)].map((match) => match[1] ?? '')

const gridClassOf = (markup: string): string =>
  classAttributes(markup).find((value) => value.includes(GRID_MARKER)) ?? ''

const cellClassesOf = (markup: string): string[] =>
  classAttributes(markup).filter((value) => value.includes(CELL_MARKER))

const renderSkeleton = (names: string[]): string =>
  renderToStaticMarkup(<LiveDataSkeleton signalNames={names} />)

const renderGrid = (signals: SignalDef[]): string =>
  renderToStaticMarkup(<LiveDataGrid signals={signals} values={{}} />)

describe('LiveDataSkeleton', () => {
  it('renders one cell per bound signal so the panel keeps its height', () => {
    expect(cellClassesOf(renderSkeleton(SIGNALS.map((s) => s.name)))).toHaveLength(3)
    expect(cellClassesOf(renderSkeleton(['rpm']))).toHaveLength(1)
    expect(cellClassesOf(renderSkeleton([]))).toHaveLength(0)
  })

  it('lays out on the same columns and row metrics as the loaded grid', () => {
    const skeleton = renderSkeleton(SIGNALS.map((s) => s.name))
    const grid = renderGrid(SIGNALS)
    expect(gridClassOf(skeleton)).toBe(gridClassOf(grid))
    expect(cellClassesOf(skeleton)).toEqual(cellClassesOf(grid))
  })

  it('sizes the label block from the signal name length', () => {
    expect(renderSkeleton(['rpm'])).toContain('w-[64px]')
    expect(renderSkeleton(['coolant_temp'])).toContain('w-[88px]')
    expect(renderSkeleton(['oil_pressure_front'])).toContain('w-[104px]')
  })

  it('announces listening with no spinner and no animation', () => {
    const markup = renderSkeleton(['rpm', 'coolant_temp'])
    expect(markup).toContain('LIVE DATA')
    expect(markup).toContain('LISTENING…')
    expect(markup).not.toMatch(/animate-|shimmer|<svg/i)
  })

  it('ships the box only, without the planche caption', () => {
    expect(renderSkeleton(['rpm'])).not.toMatch(/skeleton rows|no spinner|does not resize/i)
  })
})
