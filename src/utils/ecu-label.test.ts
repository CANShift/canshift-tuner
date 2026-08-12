import { describe, expect, it } from 'vitest'
import { ecuLabelForKey } from './ecu-label'

const INDEX = new Map([['maxxecu/maxxecu_default_can.xml', 'Maxxecu Default CAN']])

describe('ecuLabelForKey', () => {
  it('names a builtin profile from the core catalogue rather than its id', () => {
    expect(ecuLabelForKey('builtin:obd2-j1979', INDEX)).toBe('OBD-II (J1979 PIDs)')
  })

  it('uses the catalogue label when the index has loaded', () => {
    expect(ecuLabelForKey('catalogue:maxxecu/maxxecu_default_can.xml', INDEX)).toBe(
      'Maxxecu Default CAN'
    )
  })

  it('degrades to the file name when the index has not loaded', () => {
    expect(ecuLabelForKey('catalogue:maxxecu/maxxecu_default_can.xml', new Map())).toBe(
      'Maxxecu Default Can'
    )
  })

  it('strips the extension from an imported profile', () => {
    expect(ecuLabelForKey('import:my_car.xml', INDEX)).toBe('my_car')
  })

  it('keeps a colon-bearing catalogue id intact instead of splitting on every colon', () => {
    expect(ecuLabelForKey('import:weird:name.xml', INDEX)).toBe('weird:name')
  })

  it('does not throw on a key with no prefix or an unknown one', () => {
    expect(ecuLabelForKey('generic-blank', INDEX)).toBe('Generic Blank')
    expect(ecuLabelForKey('future:something', INDEX)).toBe('Something')
  })
})
