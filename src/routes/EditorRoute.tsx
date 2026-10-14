import { useState, lazy, Suspense } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import type { PreviewMode } from '../components/editor/preview/preview-modes'
import { useDashboardStore } from '../stores/dashboard.store'
import { EditorToolbar } from '../components/editor/EditorToolbar'
import { EditorPageMenu, type PageMenuAnchor } from '../components/editor/EditorPageMenu'
import { TemplateDialogs } from '../components/editor/TemplateDialogs'
import { RightSidebar } from './RightSidebar'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { UndoToast } from '../components/editor/UndoToast'
import { useDeletePage, useDeletePageKey } from '../hooks/usePageDeletion'

const Canvas = lazy(() => import('../components/editor/Canvas'))

const CanvasFallback = () => (
  <div className="flex flex-1 items-center justify-center text-[12px] text-ui-muted">
    Loading editor…
  </div>
)

const EditorEmpty = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ui-muted">
    <div className="text-[32px] opacity-20">◫</div>
    <p className="text-[14px] text-ui-ink">No config loaded</p>
    <p className="max-w-[360px] text-center text-[11px] text-ui-muted">
      Open the Vehicle tab, load a catalogue entry, then return here.
    </p>
  </div>
)

interface EditorCanvasProps {
  pages: readonly PageConfig[]
  page: PageConfig
  topBar: TopBarConfig
  onDeletePage: (pageId: string) => void
  onPageMenu: (anchor: PageMenuAnchor) => void
}

const EditorCanvas = ({ pages, page, topBar, onDeletePage, onPageMenu }: EditorCanvasProps) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('normal')
  const toolbar = (
    <EditorToolbar
      pages={pages}
      page={page}
      previewMode={previewMode}
      onPreviewMode={setPreviewMode}
      onDeletePage={onDeletePage}
    />
  )
  return (
    <ErrorBoundary scope="canvas">
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          page={page}
          topBar={topBar}
          toolbar={toolbar}
          previewMode={previewMode}
          onPageContextMenu={(pageId, x, y) => onPageMenu({ pageId, x, y })}
          inspector={<RightSidebar pageId={page.id} />}
        />
      </Suspense>
    </ErrorBoundary>
  )
}

interface EditorOverlaysProps {
  onDeletePage: (pageId: string) => void
  menu: PageMenuAnchor | null
  onCloseMenu: () => void
}

const useCurrentPage = () => {
  const pages = useDashboardStore((s) => s.config?.pages)
  const topBar = useDashboardStore((s) => s.config?.topBar)
  const selectedPageId = useDashboardStore((s) => s.selectedPageId)
  const page = pages?.find((p) => p.id === selectedPageId) ?? pages?.[0]
  return { pages, topBar, page }
}

const EditorOverlays = ({ onDeletePage, menu, onCloseMenu }: EditorOverlaysProps) => {
  const [savePageId, setSavePageId] = useState<string | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  return (
    <>
      {menu && (
        <EditorPageMenu
          anchor={menu}
          onClose={onCloseMenu}
          onDeletePage={onDeletePage}
          onSaveAsTemplate={setSavePageId}
          onManageTemplates={() => setManageOpen(true)}
        />
      )}
      <TemplateDialogs
        savePageId={savePageId}
        onCloseSave={() => setSavePageId(null)}
        manageOpen={manageOpen}
        onManageOpenChange={setManageOpen}
      />
      <UndoToast />
    </>
  )
}

const EditorRoute = () => {
  const { pages, topBar, page } = useCurrentPage()
  const deletePage = useDeletePage()
  const [menu, setMenu] = useState<PageMenuAnchor | null>(null)
  useDeletePageKey(deletePage)

  if (!pages || !topBar || !page) return <EditorEmpty />

  return (
    <div className="flex flex-1 overflow-hidden">
      <EditorCanvas
        pages={pages}
        page={page}
        topBar={topBar}
        onDeletePage={deletePage}
        onPageMenu={setMenu}
      />
      <EditorOverlays onDeletePage={deletePage} menu={menu} onCloseMenu={() => setMenu(null)} />
    </div>
  )
}

export default EditorRoute
