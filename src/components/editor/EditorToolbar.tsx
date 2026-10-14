import type { PageConfig } from '@canshift/core'
import { DashToolbar } from './DashToolbar'
import type { PreviewMode } from './preview/preview-modes'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDisplayTier } from '../../hooks/useDisplayTier'
import { usePageOps } from '../../hooks/usePageOps'
import { buildWidget, DEFAULT_NEW_WIDGET } from '../../lib/new-widget'

const fullNote = (cap: number): string =>
  `This page already holds ${String(cap)} widgets — the most this panel can render. Remove one, or put it on another page.`

const pageLabel = (index: number, isBoot: boolean): string =>
  `Page ${String(index + 1)}${isBoot ? ' · boot' : ''}`

const useUndo = () => {
  const undo = useDashboardStore((s) => s.undo)
  const canUndo = useDashboardStore((s) => s.past.length > 0)
  const lastLabel = useDashboardStore((s) => s.past[s.past.length - 1]?.label)
  const undoTitle = lastLabel === undefined ? 'Undo' : `Undo ${lastLabel}`
  return { undo, canUndo, undoTitle }
}

const usePageOptions = (pages: readonly PageConfig[]) => {
  const defaultPageId = useDashboardStore((s) => s.config?.defaultPageId)
  return pages.map((candidate, index) => ({
    id: candidate.id,
    label: pageLabel(index, candidate.id === defaultPageId),
  }))
}

const useAddWidget = (pageId: string) => {
  const addWidget = useDashboardStore((s) => s.addWidget)
  return () => {
    addWidget(pageId, buildWidget(DEFAULT_NEW_WIDGET))
  }
}

const useCapacity = (page: PageConfig) => {
  const cap = useDisplayTier().maxWidgetsPerPage
  return { used: page.widgets.length, cap, fullNote: fullNote(cap) }
}

export interface EditorToolbarProps {
  pages: readonly PageConfig[]
  page: PageConfig
  previewMode: PreviewMode
  onPreviewMode: (mode: PreviewMode) => void
  onDeletePage: (pageId: string) => void
}

export const EditorToolbar = ({
  pages,
  page,
  previewMode,
  onPreviewMode,
  onDeletePage,
}: EditorToolbarProps) => {
  const selectPage = useDashboardStore((s) => s.selectPage)
  const { undo, canUndo, undoTitle } = useUndo()
  const pageOptions = usePageOptions(pages)
  const pageOps = usePageOps(pages, page.id, onDeletePage)
  const capacity = useCapacity(page)
  const addWidget = useAddWidget(page.id)

  return (
    <DashToolbar
      pages={pageOptions}
      selectedPageId={page.id}
      onSelectPage={selectPage}
      pageOps={pageOps}
      undoTitle={undoTitle}
      canUndo={canUndo}
      onUndo={undo}
      previewMode={previewMode}
      onPreviewMode={onPreviewMode}
      capacity={capacity}
      onAddWidget={addWidget}
    />
  )
}
