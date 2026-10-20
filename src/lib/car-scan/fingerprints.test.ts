import { describe, expect, it } from 'vitest'
import { carFingerprints } from './fingerprints'
import { matchCars } from './match-cars'

describe('carFingerprints', () => {
  it('fingerprints the built-in MaxxECU profile by its broadcast frames', async () => {
    const prints = await carFingerprints()
    const maxxecu = prints.find((print) => print.key === 'builtin:maxxecu-street')
    expect(maxxecu && [...maxxecu.frameIds].sort((a, b) => a - b)).toEqual([
      0x370, 0x371, 0x372, 0x373, 0x374, 0x375,
    ])
  })

  it('leaves out the polled OBD-II profile and the empty template', async () => {
    const keys = (await carFingerprints()).map((print) => print.key)
    expect(keys).not.toContain('builtin:obd2-j1979')
    expect(keys).not.toContain('builtin:generic-blank')
  })

  it('fingerprints the shipped catalogue', async () => {
    const prints = await carFingerprints()
    expect(prints.filter((print) => print.key.startsWith('catalogue:')).length).toBeGreaterThan(20)
  })

  it('finds the MaxxECU on a bus carrying its frames', async () => {
    const seen = new Set([0x370, 0x371, 0x372, 0x373, 0x374, 0x375])
    const [best] = matchCars(seen, await carFingerprints())
    expect(best?.confidence).toBe('strong')
    expect(best?.label).toMatch(/maxx/i)
  })
})
