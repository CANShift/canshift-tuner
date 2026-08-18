import { describe, expect, it } from 'vitest'
import { CONTROL_STATES } from '@canshift/core'
import {
  controlFor,
  controlSurface,
  controlText,
  defaultControlColors,
  statesFor,
} from './control-paint'

const COLORS = defaultControlColors('#FFFFFF', '#FF4747')

describe('controlSurface', () => {
  it('pulses on armed and on nothing else', () => {
    const pulsing = CONTROL_STATES.filter((state) => controlSurface(state, COLORS).pulses)
    expect(pulsing).toEqual(['armed'])
  })

  it('fills the ground only when the control is engaged', () => {
    expect(controlSurface('off', COLORS).background).toBe('transparent')
    expect(controlSurface('armed', COLORS).background).toBe('transparent')
    expect(controlSurface('active', COLORS).background).toBe('#FF4747')
    expect(controlSurface('unavailable', COLORS).background).toBe('transparent')
  })

  it('gives an unavailable control the lock pair, not a grey-out of the ink', () => {
    const locked = controlSurface('unavailable', COLORS)
    expect(locked.borderColor).toBe('#333333')
    expect(locked.wordColor).toBe('#6B6B6B')
    expect(locked.kickerColor).toBe('#6B6B6B')
  })

  it('drops the engaged kicker to 75 % rather than tinting it', () => {
    expect(controlSurface('active', COLORS).kickerColor).toBe('#FFFFFF')
    expect(controlSurface('active', COLORS).kickerOpacity).toBe(0.75)
    expect(controlSurface('off', COLORS).kickerOpacity).toBe(1)
  })
})

describe('statesFor', () => {
  it('offers armed only on the controls that declare it', () => {
    expect(statesFor(controlFor('LAUNCH'))).toContain('armed')
    expect(statesFor(controlFor('CRUISE'))).toContain('armed')
    expect(statesFor(controlFor('TRACTION'))).toContain('armed')
    expect(statesFor(controlFor('ANTI-LAG'))).not.toContain('armed')
    expect(statesFor(controlFor('PIT LIMIT'))).not.toContain('armed')
    expect(statesFor(controlFor('ECU MAP'))).not.toContain('armed')
  })

  it('leaves a button that is not one of the six with two states', () => {
    expect(statesFor(controlFor('BOOST'))).toEqual(['off', 'active'])
  })
})

describe('controlText', () => {
  it('stacks the reason as a qualifier instead of joining it to the name', () => {
    const locked = controlText(controlFor('ANTI-LAG')!, 'unavailable', 'ANTI-LAG')
    expect(locked.kicker).toBe('ANTI-LAG')
    expect(locked.qualifier).toBe('EGT HIGH')
    expect(locked.word).toBe('LOCKED')
  })

  it('fills the parameter a phrase asks for', () => {
    expect(controlText(controlFor('LAUNCH')!, 'armed', 'LAUNCH').qualifier).toBe('4200 rpm')
    expect(controlText(controlFor('TRACTION')!, 'active', 'TRACTION').word).toBe('LEVEL 3')
    expect(controlText(controlFor('PIT LIMIT')!, 'unavailable', 'PIT').qualifier).toBe('GEAR 4')
  })

  it('falls back to the widget label when the state has no word of its own', () => {
    expect(controlText(controlFor('ANTI-LAG')!, 'armed', 'ANTI-LAG').word).toBe('ANTI-LAG')
  })
})
