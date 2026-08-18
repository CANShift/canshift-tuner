import { describe, expect, it } from 'vitest'
import { ECU_PROFILES } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { parseProfileXml, profileXmlFilename, serializeProfileXml } from './profile-xml'

const MAXXECU = ECU_PROFILES.find((profile) => profile.id === 'maxxecu-street')?.signals ?? []

const roundTrip = (signals: readonly SignalDef[]): SignalDef[] => {
  const result = parseProfileXml(serializeProfileXml(signals))
  if (result.kind !== 'ok') throw new Error(`expected ok, got ${result.kind}`)
  return result.signals
}

describe('profile XML', () => {
  it('round-trips a built-in profile without losing a signal', () => {
    expect(MAXXECU.length).toBeGreaterThan(0)
    expect(roundTrip(MAXXECU)).toEqual(MAXXECU)
  })

  it('preserves the byte layout of a multi-byte big-endian signed signal', () => {
    const signal: SignalDef = {
      name: 'oil_temp',
      canFrameId: '0x360',
      startByte: 2,
      byteLength: 2,
      bigEndian: true,
      signed: true,
      scale: 0.1,
      offset: -40,
      unit: '°C',
      min: -40,
      max: 200,
      timeoutMs: 1500,
    }
    expect(roundTrip([signal])).toEqual([signal])
  })

  it('carries the optional warning and danger levels across the round trip', () => {
    const signal: SignalDef = {
      name: 'coolant',
      canFrameId: '0x361',
      startByte: 0,
      byteLength: 1,
      bigEndian: false,
      signed: false,
      scale: 1,
      offset: 0,
      unit: 'C',
      min: 0,
      max: 150,
      warningLevel: 100,
      dangerLevel: 115,
      timeoutMs: 1000,
    }
    expect(roundTrip([signal])).toEqual([signal])
  })

  it('escapes a quote in a name instead of breaking the attribute', () => {
    const xml = serializeProfileXml([{ ...MAXXECU[0], name: 'a"b' } as SignalDef])
    expect(xml).toContain('name="a&quot;b"')
    expect(roundTrip([{ ...MAXXECU[0], name: 'a"b' } as SignalDef])[0]?.name).toBe('a"b')
  })

  it('reports a file that is not a CANShift profile', () => {
    expect(parseProfileXml('<RealDashCAN version="2"></RealDashCAN>')).toEqual({
      kind: 'not-a-profile',
    })
  })

  it('reports a profile that declares no signals', () => {
    expect(parseProfileXml('<canshift-profile><signals></signals></canshift-profile>')).toEqual({
      kind: 'empty',
    })
  })

  it('names the offending signal when a row is invalid', () => {
    const xml =
      '<canshift-profile><signals><signal name="bad" id="nope" /></signals></canshift-profile>'
    const result = parseProfileXml(xml)
    expect(result.kind).toBe('invalid')
    if (result.kind === 'invalid') expect(result.message).toContain('"bad"')
  })

  it('slugifies the profile label into the download name', () => {
    expect(profileXmlFilename('MaxxECU Street / Race')).toBe('maxxecu-street-race.canshift.xml')
    expect(profileXmlFilename('   ')).toBe('profile.canshift.xml')
  })
})
