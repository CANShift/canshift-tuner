import type { PageConfig, Widget } from '@canshift/core'
import { signalDisplayLabel } from '@canshift/core'
import { STRINGS } from '../../strings'

const C = STRINGS.changes

export type ChangeSection = 'gauges' | 'car' | 'dash'

export interface ChangeText {
  section: ChangeSection
  where: string
  what: string
  was: string
}

const titleCase = (text: string): string => text.replace(/\b\w/g, (letter) => letter.toUpperCase())

const humanize = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim()

export const pageName = (page: Pick<PageConfig, 'id'>): string => titleCase(humanize(page.id))

export const widgetNoun = (widget: Pick<Widget, 'type'>): string =>
  (STRINGS.nouns as Record<string, string>)[widget.type] ?? STRINGS.nouns.gauge

const kickerOf = (widget: Widget): string | undefined => {
  const kicker = (widget.config as { kicker?: unknown } | undefined)?.kicker
  return typeof kicker === 'string' && kicker.length > 0 ? kicker : undefined
}

const baseName = (widget: Widget): string =>
  widget.signal === '' ? widgetNoun(widget) : signalDisplayLabel(widget.signal)

const ACRONYM_MAX = 3

const prettyLabel = (label: string): string =>
  label.length <= ACRONYM_MAX ? label.toUpperCase() : titleCase(label.toLowerCase())

export const signalName = (signal: string): string => prettyLabel(signalDisplayLabel(signal))

export const widgetName = (widget: Widget): string =>
  prettyLabel(kickerOf(widget) ?? baseName(widget))

export const formatValue = (value: unknown): string => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (typeof value === 'boolean') return value ? 'on' : 'off'
  return ''
}

export const wasText = (value: unknown): string => {
  const text = formatValue(value)
  return text.length === 0 ? '' : C.was(text)
}

export const settingName = humanize
