import { describe, expect, it } from 'vitest'
import { signalRedLimits } from './signal-red-limits'

describe('signalRedLimits', () => {
  it('lists both sides of a battery', () => {
    const battery = {
      warningLevel: 12,
      dangerLevel: 11.5,
      highWarningLevel: 15,
      highDangerLevel: 16,
    }
    expect(signalRedLimits(battery)).toEqual([
      { direction: 'below', value: 11.5 },
      { direction: 'above', value: 16 },
    ])
  })

  it('reads a low-side pair from its order', () => {
    expect(signalRedLimits({ warningLevel: 1.5, dangerLevel: 1 })).toEqual([
      { direction: 'below', value: 1 },
    ])
  })

  it('reads a lone danger level as high side', () => {
    expect(signalRedLimits({ dangerLevel: 115 })).toEqual([{ direction: 'above', value: 115 }])
  })

  it('is empty without limits or without a signal', () => {
    expect(signalRedLimits({})).toEqual([])
    expect(signalRedLimits(undefined)).toEqual([])
  })
})
