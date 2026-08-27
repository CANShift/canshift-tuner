import { describe, expect, it } from 'vitest'
import { convertibleUnitFor, displayUnitFor } from './unit-display'

describe('the unit a preview shows, and the one it converts with', () => {
  it('swaps the declared symbol for the active system', () => {
    expect(displayUnitFor('', 'km/h', 'imperial')).toBe('mph')
    expect(displayUnitFor('', '°C', 'imperial')).toBe('°F')
    expect(displayUnitFor('', 'km/h', 'metric')).toBe('km/h')
  })

  it('leaves a unit with no imperial counterpart alone', () => {
    expect(displayUnitFor('', 'rpm', 'imperial')).toBe('rpm')
    expect(convertibleUnitFor('', 'rpm')).toBe('rpm')
  })

  it('takes an explicit suffix verbatim and converts nothing', () => {
    expect(displayUnitFor('%', 'km/h', 'imperial')).toBe('%')
    expect(convertibleUnitFor('%', 'km/h')).toBe('')
  })

  it('has nothing to show or convert for an unbound widget', () => {
    expect(displayUnitFor('', '', 'imperial')).toBe('')
    expect(convertibleUnitFor('', '')).toBe('')
  })
})
