import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { displayLabelForSignal } from './signal-labels'

const FIRMWARE_TABLE = resolve(
  import.meta.dirname,
  '../../../canshift-firmware/src/ui/signal_presentation.cpp'
)

const parseFirmware = (source: string): [string, string][] => {
  const table = /constexpr Entry kEntries\[\] = \{([\s\S]*?)\n\};/.exec(source)
  if (!table) return []
  const rows = [...(table[1] ?? '').matchAll(/\{"([^"]+)",\s*"((?:[^"\\]|\\.)*)",/g)]
  return rows.map((row) => [
    row[1] ?? '',
    (row[2] ?? '').replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    ),
  ])
}

describe('displayLabelForSignal', () => {
  it('names the six default pages the way the design comp does', () => {
    expect(displayLabelForSignal('coolant_temp_c')).toBe('WATER')
    expect(displayLabelForSignal('oil_temp_c')).toBe('OIL T')
    expect(displayLabelForSignal('oil_press_bar')).toBe('OIL PRESS')
    expect(displayLabelForSignal('fuel_level_pct')).toBe('FUEL')
    expect(displayLabelForSignal('odo_km')).toBe('ODO')
  })

  it('never gives two signals the same label, or a page reads OIL twice', () => {
    const signals = [
      'oil_temp_c',
      'oil_press_bar',
      'fuel_press_bar',
      'fuel_level_pct',
      'boost_bar',
      'boost_target_bar',
    ]
    const labels = signals.map(displayLabelForSignal)
    expect(new Set(labels).size).toBe(signals.length)
  })

  it('falls back to the signal name for anything it does not curate', () => {
    expect(displayLabelForSignal('brake_temp_fl')).toBe('BRAKE TEMP FL')
    expect(displayLabelForSignal('')).toBe('—')
  })
})

const firmwareEntries = existsSync(FIRMWARE_TABLE)
  ? parseFirmware(readFileSync(FIRMWARE_TABLE, 'utf8'))
  : []

const describeIfFirmware = firmwareEntries.length > 0 ? describe : describe.skip

describeIfFirmware('signal label firmware parity', () => {
  it('reads the firmware table', () => {
    expect(firmwareEntries.length).toBeGreaterThan(20)
  })

  it('every row reads the same on the canvas as on the glass', () => {
    const drifted = firmwareEntries.filter(
      ([signal, label]) => displayLabelForSignal(signal) !== label
    )
    expect(drifted).toEqual([])
  })
})
