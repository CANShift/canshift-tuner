import type { Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import type { Change, ChangeTarget } from './change'
import {
  formatValue,
  pageName,
  settingName,
  signalName,
  wasText,
  widgetName,
  widgetNoun,
} from './describe'
import type { ChangeText } from './describe'
import { pathKey, sameValue, type SetupPath } from './setup-path'

const C = STRINGS.changes

type Config = Record<string, unknown>

interface WidgetPair {
  before: Widget
  after: Widget
  where: string
}

const configOf = (widget: Widget): Config => (widget.config ?? {}) as Config

type LimitKey = 'warnLevel' | 'dangerLevel'

const LIMIT_WORDS: Record<LimitKey, string> = { warnLevel: C.warning, dangerLevel: C.danger }

const direction = (after: Widget): string =>
  configOf(after).dangerBelow === true ? C.below : C.above

const limitWhat = (pair: WidgetPair, key: LimitKey): string => {
  const value = configOf(pair.after)[key]
  const name = widgetName(pair.after)
  if (value === undefined) return C.noLimit(name, LIMIT_WORDS[key])
  return C.limit(name, `${LIMIT_WORDS[key]} ${direction(pair.after)}`, formatValue(value))
}

const CONFIG_WHAT: Record<string, (pair: WidgetPair) => string> = {
  kicker: (pair) => C.renamedWidget(widgetNoun(pair.after), widgetName(pair.after)),
  warnLevel: (pair) => limitWhat(pair, 'warnLevel'),
  dangerLevel: (pair) => limitWhat(pair, 'dangerLevel'),
}

const configWhat = (pair: WidgetPair, key: string): string =>
  CONFIG_WHAT[key]?.(pair) ?? C.tunedWidget(widgetName(pair.after), settingName(key))

const FIELD_WHAT: Record<string, (pair: WidgetPair) => string> = {
  signal: (pair) => C.widgetShows(widgetName(pair.after), signalName(pair.after.signal)),
  layout: (pair) => C.movedWidget(widgetName(pair.after)),
  style: (pair) => C.recolouredWidget(widgetName(pair.after)),
}

const fieldWhat = (pair: WidgetPair, key: string): string =>
  FIELD_WHAT[key]?.(pair) ?? C.tunedWidget(widgetName(pair.after), settingName(key))

const changeAt = (
  path: SetupPath,
  where: string,
  target: ChangeTarget,
  text: Pick<ChangeText, 'what' | 'was'>
): Change => ({
  id: pathKey(path),
  section: 'gauges',
  where,
  ...text,
  revert: { kind: 'path', path },
  target,
})

const keysOf = (a: object, b: object): string[] => [
  ...new Set([...Object.keys(a), ...Object.keys(b)]),
]

const configChanges = (pair: WidgetPair, base: SetupPath, target: ChangeTarget): Change[] => {
  const before = configOf(pair.before)
  const after = configOf(pair.after)
  return keysOf(before, after)
    .filter((key) => !sameValue(before[key], after[key]))
    .map((key) =>
      changeAt([...base, 'config', key], pair.where, target, {
        what: configWhat(pair, key),
        was: wasText(before[key]),
      })
    )
}

const SKIPPED_FIELDS = new Set(['id', 'config'])

const fieldWas = (pair: WidgetPair, key: string): string =>
  key === 'signal' ? C.was(signalName(pair.before.signal)) : wasText((pair.before as Config)[key])

const fieldChanges = (pair: WidgetPair, base: SetupPath, target: ChangeTarget): Change[] =>
  keysOf(pair.before, pair.after)
    .filter((key) => !SKIPPED_FIELDS.has(key))
    .filter((key) => !sameValue((pair.before as Config)[key], (pair.after as Config)[key]))
    .map((key) =>
      changeAt([...base, key], pair.where, target, {
        what: fieldWhat(pair, key),
        was: fieldWas(pair, key),
      })
    )

const changedWidget = (pair: WidgetPair, base: SetupPath, target: ChangeTarget): Change[] =>
  pair.before.type === pair.after.type
    ? [...fieldChanges(pair, base, target), ...configChanges(pair, base, target)]
    : [changeAt(base, pair.where, target, { what: fieldWhat(pair, 'type'), was: '' })]

const byId = (widgets: readonly Widget[]): Map<string, Widget> =>
  new Map(widgets.map((widget) => [widget.id, widget]))

interface PageWidgets {
  pageId: string
  pagePath: SetupPath
  before: readonly Widget[]
  after: readonly Widget[]
}

const addedOrRemoved = (input: PageWidgets, widget: Widget, added: boolean): Change => {
  const where = C.pageWhere(pageName({ id: input.pageId }))
  const path = [...input.pagePath, 'widgets', { id: widget.id }]
  const describe = added ? C.addedWidget : C.removedWidget
  return changeAt(
    path,
    where,
    { pageId: input.pageId, ...(added ? { widgetId: widget.id } : {}) },
    {
      what: describe(widgetNoun(widget), widgetName(widget)),
      was: added ? C.newItem : C.wasOnDash,
    }
  )
}

const commonChanges = (input: PageWidgets, before: Widget, after: Widget): Change[] => {
  const where = C.pageWhere(pageName({ id: input.pageId }))
  const base = [...input.pagePath, 'widgets', { id: after.id }]
  return changedWidget({ before, after, where }, base, { pageId: input.pageId, widgetId: after.id })
}

export const widgetChanges = (input: PageWidgets): Change[] => {
  const before = byId(input.before)
  const after = byId(input.after)
  const removed = input.before
    .filter((w) => !after.has(w.id))
    .map((w) => addedOrRemoved(input, w, false))
  const added = input.after
    .filter((w) => !before.has(w.id))
    .map((w) => addedOrRemoved(input, w, true))
  const changed = input.after.flatMap((w) => {
    const previous = before.get(w.id)
    return previous === undefined ? [] : commonChanges(input, previous, w)
  })
  return [...removed, ...added, ...changed]
}
