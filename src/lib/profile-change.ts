import { parseCanXml } from '@canshift/core'
import type { DashboardConfig, SignalDef } from '@canshift/core'
import { parseProfileXml } from './profile-xml'

export type ProfileParse =
  | { kind: 'ok'; signals: SignalDef[]; warnings: readonly string[] }
  | { kind: 'error'; message: string }

const NO_SIGNALS = 'it declares no usable signals'

export const parseProfileFile = (fileName: string, xml: string): ProfileParse => {
  const own = parseProfileXml(xml)
  if (own.kind === 'ok') return { kind: 'ok', signals: own.signals, warnings: [] }
  if (own.kind === 'empty') return { kind: 'error', message: `"${fileName}" — ${NO_SIGNALS}` }
  if (own.kind === 'invalid') return { kind: 'error', message: `"${fileName}" — ${own.message}` }

  const vendor = parseCanXml(xml)
  if (vendor.signals.length > 0)
    return { kind: 'ok', signals: vendor.signals, warnings: vendor.warnings }
  return { kind: 'error', message: `"${fileName}" — ${vendor.warnings[0] ?? NO_SIGNALS}` }
}

export const lostBindingCount = (
  config: DashboardConfig | null,
  next: readonly SignalDef[]
): number => {
  if (!config) return 0
  const names = new Set(next.map((signal) => signal.name))
  return config.pages.reduce(
    (total, page) =>
      total +
      page.widgets.filter((widget) => widget.signal.length > 0 && !names.has(widget.signal)).length,
    0
  )
}

const plural = (count: number, noun: string): string =>
  `${String(count)} ${noun}${count === 1 ? '' : 's'}`

export const changeSummary = (
  label: string,
  current: readonly SignalDef[],
  next: readonly SignalDef[],
  lost: number
): string => {
  const head = `${label} — ${String(next.length)} signals replacing ${String(current.length)}.`
  if (lost === 0) return `${head} No bound widget loses its signal.`
  const verb = lost === 1 ? 'loses its' : 'lose their'
  return `${head} ${plural(lost, 'bound widget')} ${verb} signal.`
}

export const appliedSummary = (label: string, count: number): string =>
  `${label} applied — ${plural(count, 'signal')} in the profile. Save to keep it, burn to send it to the dash.`
