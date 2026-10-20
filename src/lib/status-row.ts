import type { PageConfig, PageStatusRow, TopBarItem } from '@canshift/core'

export type StatusSlot = 'center' | 'right'

export const STATUS_SLOTS: readonly StatusSlot[] = ['center', 'right']

export type StatusItem = Extract<TopBarItem, { type: StatusItemKind }>

export const STATUS_ITEM_KINDS = ['signal', 'signalMax', 'timer', 'flagWord'] as const

export type StatusItemKind = (typeof STATUS_ITEM_KINDS)[number]

const DEFAULT_ITEMS: Record<StatusItemKind, (slot: StatusSlot) => StatusItem> = {
  signal: (position) => ({ type: 'signal', signal: 'rpm', format: '%.0f', position }),
  signalMax: (position) => ({
    type: 'signalMax',
    signal: 'oil_temp_c',
    text: 'MAX',
    format: '%.0f',
    position,
  }),
  timer: (position) => ({ type: 'timer', source: 'lapCount', text: 'LAP', position }),
  flagWord: (position) => ({
    type: 'flagWord',
    signal: 'flag_launch_ctrl',
    text: 'ON',
    offText: 'OFF',
    position,
  }),
}

export const defaultStatusItem = (kind: StatusItemKind, slot: StatusSlot): StatusItem =>
  DEFAULT_ITEMS[kind](slot)

export const isStatusItem = (item: TopBarItem | undefined): item is StatusItem =>
  item !== undefined && (STATUS_ITEM_KINDS as readonly string[]).includes(item.type)

const withoutSlot = (row: PageStatusRow, slot: StatusSlot): PageStatusRow => {
  const { [slot]: _dropped, ...rest } = row
  return rest
}

export const withStatusItem = (
  page: PageConfig,
  slot: StatusSlot,
  item: TopBarItem | null
): PageConfig => {
  const row = page.statusRow ?? {}
  const next = item === null ? withoutSlot(row, slot) : { ...row, [slot]: item }
  const { statusRow: _previous, ...rest } = page
  return Object.keys(next).length === 0 ? rest : { ...rest, statusRow: next }
}
