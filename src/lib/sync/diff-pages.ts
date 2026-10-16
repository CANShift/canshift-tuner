import type { PageConfig } from '@canshift/core'
import { STRINGS } from '../../strings'
import type { Change } from './change'
import { pageName } from './describe'
import { widgetChanges } from './diff-widgets'
import { pathKey, sameValue, type SetupPath } from './setup-path'

const C = STRINGS.changes

const PAGES: SetupPath = ['dashboard', 'pages']

const pagePath = (page: PageConfig): SetupPath => [...PAGES, { id: page.id }]

const pageChange = (page: PageConfig, path: SetupPath, what: string, was: string): Change => ({
  id: pathKey(path),
  section: 'gauges',
  where: C.pageWhere(pageName(page)),
  what,
  was,
  revert: { kind: 'path', path },
  target: { pageId: page.id },
})

const SKIPPED_FIELDS = new Set(['id', 'widgets'])

const pageFieldChanges = (before: PageConfig, after: PageConfig): Change[] => {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
  const record = (page: PageConfig) => page as unknown as Record<string, unknown>
  return keys
    .filter((key) => !SKIPPED_FIELDS.has(key))
    .filter((key) => !sameValue(record(before)[key], record(after)[key]))
    .map((key) => pageChange(after, [...pagePath(after), key], C.changedPage(pageName(after)), ''))
}

const commonPageChanges = (before: PageConfig, after: PageConfig): Change[] => [
  ...pageFieldChanges(before, after),
  ...widgetChanges({
    pageId: after.id,
    pagePath: pagePath(after),
    before: before.widgets,
    after: after.widgets,
  }),
]

const orderOf = (pages: readonly PageConfig[], keep: ReadonlySet<string>): string[] =>
  pages.map((page) => page.id).filter((id) => keep.has(id))

const orderChange = (before: readonly PageConfig[], after: readonly PageConfig[]): Change[] => {
  const shared = new Set(before.map((p) => p.id).filter((id) => after.some((p) => p.id === id)))
  if (sameValue(orderOf(before, shared), orderOf(after, shared))) return []
  return [
    {
      id: 'dashboard/pages/#order',
      section: 'gauges',
      where: C.gaugesWhere,
      what: C.reorderedPages,
      was: '',
      revert: { kind: 'order' },
      target: null,
    },
  ]
}

export const pageChanges = (
  before: readonly PageConfig[],
  after: readonly PageConfig[]
): Change[] => {
  const previous = new Map(before.map((page) => [page.id, page]))
  const next = new Set(after.map((page) => page.id))
  const removed = before
    .filter((page) => !next.has(page.id))
    .map((page) => pageChange(page, pagePath(page), C.removedPage(pageName(page)), C.wasOnDash))
  const touched = after.flatMap((page) => {
    const old = previous.get(page.id)
    if (old === undefined)
      return [pageChange(page, pagePath(page), C.addedPage(pageName(page)), C.newItem)]
    return commonPageChanges(old, page)
  })
  return [...removed, ...touched, ...orderChange(before, after)]
}
