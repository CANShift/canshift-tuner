import { describe, expect, it } from 'vitest'
import { THEME_STATUS, resolveThemeStatus } from './ThemeStatusCard'

describe('resolveThemeStatus', () => {
  it('reports simulation even while a device is connected and reporting a mode', () => {
    expect(resolveThemeStatus({ isDayMode: true, connected: true, simulationMode: true })).toBe(
      'simulation'
    )
  })

  it('reports disconnected before waiting on a handshake', () => {
    expect(resolveThemeStatus({ isDayMode: null, connected: false, simulationMode: false })).toBe(
      'disconnected'
    )
  })

  it('waits on the handshake once connected with no mode yet', () => {
    expect(resolveThemeStatus({ isDayMode: null, connected: true, simulationMode: false })).toBe(
      'reading'
    )
  })

  it('resolves the device mode once the firmware reports one', () => {
    expect(resolveThemeStatus({ isDayMode: true, connected: true, simulationMode: false })).toBe(
      'day'
    )
    expect(resolveThemeStatus({ isDayMode: false, connected: true, simulationMode: false })).toBe(
      'night'
    )
  })
})

describe('THEME_STATUS', () => {
  it('only paints the day palette for a device actually reporting day', () => {
    const dayVariants = Object.entries(THEME_STATUS)
      .filter(([, visual]) => visual.variant === 'day')
      .map(([status]) => status)

    expect(dayVariants).toEqual(['day'])
  })

  it('labels the unresolved states "Theme" and the resolved ones "Current theme"', () => {
    expect(THEME_STATUS.simulation.label).toBe('Theme')
    expect(THEME_STATUS.disconnected.label).toBe('Theme')
    expect(THEME_STATUS.reading.label).toBe('Theme')
    expect(THEME_STATUS.day.label).toBe('Current theme')
    expect(THEME_STATUS.night.label).toBe('Current theme')
  })
})
