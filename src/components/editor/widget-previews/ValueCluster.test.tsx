import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Kicker, ValueRow, valueTrackingPx } from './ValueCluster'
import { TopRule } from './TopRule'

const CANVAS_SCALE = 2

describe('the value row', () => {
  it('sits flush left, 8 device px below the middle, at the canvas scale', () => {
    const markup = renderToStaticMarkup(
      <ValueRow text="165" unit="km/h" color="#FFFFFF" devicePx={48} scale={CANVAS_SCALE} />
    )
    expect(markup).toContain('left-0')
    expect(markup).not.toContain('justify-center')
    expect(markup).toContain('top:calc(50% + 16px)')
    expect(markup).toContain('font-size:96px')
    expect(markup).toContain('letter-spacing:-4px')
  })

  it('sets the unit at 10 device px whatever the value class', () => {
    const markup = renderToStaticMarkup(
      <ValueRow text="92" unit="°C" color="#FFFFFF" devicePx={17} scale={CANVAS_SCALE} />
    )
    expect(markup).toContain('font-size:20px')
  })

  it('tracks values the way the dash does', () => {
    expect(valueTrackingPx(48)).toBe(-2)
    expect(valueTrackingPx(22)).toBe(-1)
    expect(valueTrackingPx(10)).toBe(0)
  })
})

describe('the kicker', () => {
  it('scales its 10 px face and 4 px inset with the canvas', () => {
    const markup = renderToStaticMarkup(<Kicker text="SPEED" scale={CANVAS_SCALE} />)
    expect(markup).toContain('font-size:20px')
    expect(markup).toContain('left:8px')
    expect(markup).toContain('top:8px')
  })
})

describe('the top rule', () => {
  it('picks its tier from the device font, not the canvas one', () => {
    const secondary = renderToStaticMarkup(
      <TopRule devicePx={22} scale={CANVAS_SCALE} inkColor="#FFFFFF" />
    )
    expect(secondary).toContain('height:2px')
    expect(secondary).toContain('background:#222222')
    const primary = renderToStaticMarkup(
      <TopRule devicePx={32} scale={CANVAS_SCALE} inkColor="#FFFFFF" />
    )
    expect(primary).toContain('height:4px')
    expect(primary).toContain('background:#FFFFFF')
  })
})
