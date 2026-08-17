import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { PageConfig } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE, FIRMWARE_CAPS, HexColorSchema } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { PageStrip } from '../components/editor/PageStrip'
import { NewPageMenu } from '../components/editor/NewPageMenu'
import { SaveTemplateDialog } from '../components/editor/SaveTemplateDialog'
import { ManageTemplatesDialog } from '../components/editor/ManageTemplatesDialog'
import { PageContextMenu } from './PageContextMenu'
import { RightSidebar } from './RightSidebar'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { createId } from '../utils/id'
import { instantiateTemplate } from '../lib/page-template'
import { useTemplateStore } from '../stores/template/template.store'
import type { PageTemplateEntry } from '../stores/template/storage'
import { isEditableTarget } from '../utils/is-editable-target'
import { useUndoToastStore } from '../stores/undo-toast.store'
import { UndoToast } from '../components/editor/UndoToast'

const Canvas = lazy(() => import('../components/editor/Canvas'))

const NEW_PAGE_BG = HexColorSchema.parse('#000000')

const buildBlankPage = (): PageConfig => ({
  id: createId('page'),
  backgroundImage: null,
  backgroundColor: NEW_PAGE_BG,
  palette: { ...DEFAULT_PAGE_PALETTE },
  showTopBar: true,
  visible: true,
  widgets: [],
})

const CanvasFallback = () => {
  return (
    <div className="flex flex-1 items-center justify-center text-[12px] text-ui-muted">
      Loading editor…
    </div>
  )
}

const EditorRoute = () => {
  const pages = useDashboardStore((s) => s.config?.pages)
  const topBar = useDashboardStore((s) => s.config?.topBar)
  const defaultPageId = useDashboardStore((s) => s.config?.defaultPageId)
  const selectedPageId = useDashboardStore((s) => s.selectedPageId)
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)

  const { selectPage, addPage, duplicatePage, removePage, setDefaultPage, movePage, updatePage } =
    useDashboardStore(
      useShallow((s) => ({
        selectPage: s.selectPage,
        addPage: s.addPage,
        duplicatePage: s.duplicatePage,
        removePage: s.removePage,
        setDefaultPage: s.setDefaultPage,
        movePage: s.movePage,
        updatePage: s.updatePage,
      }))
    )

  const [contextMenu, setContextMenu] = useState<{
    pageId: string
    x: number
    y: number
  } | null>(null)

  const saveTemplate = useTemplateStore((s) => s.saveTemplate)
  const [saveTemplatePageId, setSaveTemplatePageId] = useState<string | null>(null)
  const [manageOpen, setManageOpen] = useState(false)

  const dragFromIndex = useRef<number | null>(null)

  const showUndoToast = useUndoToastStore((s) => s.showForLastAction)

  const deletePage = useCallback(
    (pageId: string) => {
      removePage(pageId)
      showUndoToast()
    },
    [removePage, showUndoToast]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (isEditableTarget(e.target)) return
      if (selectedWidgetId) return
      if (!selectedPageId || !pages || pages.length <= 1) return
      deletePage(selectedPageId)
    },
    [selectedPageId, pages, selectedWidgetId, deletePage]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handlePageDragStart = useCallback((index: number) => {
    dragFromIndex.current = index
  }, [])
  const handlePageDrop = useCallback(
    (toIndex: number) => {
      if (dragFromIndex.current !== null && dragFromIndex.current !== toIndex) {
        movePage(dragFromIndex.current, toIndex)
      }
      dragFromIndex.current = null
    },
    [movePage]
  )
  const handlePageContextMenu = useCallback((pageId: string, x: number, y: number) => {
    setContextMenu({ pageId, x, y })
  }, [])

  if (!pages || !topBar) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ui-muted">
        <div className="text-[32px] opacity-20">◫</div>
        <p className="text-[14px] text-ui-ink">No config loaded</p>
        <p className="max-w-[360px] text-center text-[11px] text-ui-muted">
          Open the ECU Profile route, load a catalogue entry, then return here.
        </p>
      </div>
    )
  }

  const currentPage = pages.find((p) => p.id === selectedPageId) ?? pages[0]
  const atCap = pages.length >= FIRMWARE_CAPS.MAX_PAGES

  const currentPageIndex = currentPage ? pages.findIndex((p) => p.id === currentPage.id) : -1

  const pageStrip = (
    <PageStrip
      pages={pages}
      topBar={topBar}
      selectedPageId={selectedPageId}
      defaultPageId={defaultPageId}
      atCap={atCap}
      newPageControl={
        <NewPageMenu
          atCap={atCap}
          onAddBlank={() => {
            if (!atCap) addPage(buildBlankPage())
          }}
          onInsertTemplate={(entry: PageTemplateEntry) => {
            if (!atCap) addPage(instantiateTemplate(entry))
          }}
          onManage={() => {
            setManageOpen(true)
          }}
        />
      }
      onSelect={selectPage}
      onAdd={() => {
        if (!atCap) addPage(buildBlankPage())
      }}
      onDragStart={handlePageDragStart}
      onDrop={handlePageDrop}
      onSetDefault={setDefaultPage}
      onRemove={deletePage}
      onContextMenu={handlePageContextMenu}
    />
  )

  return (
    <div className="flex flex-1 overflow-hidden">
      {currentPage ? (
        <ErrorBoundary scope="canvas">
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              page={currentPage}
              topBar={topBar}
              pageIndex={currentPageIndex >= 0 ? currentPageIndex : undefined}
              pageStrip={pageStrip}
              inspector={<RightSidebar pageId={currentPage.id} />}
            />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <div className="flex flex-1 items-center justify-center text-brand-neutral-500">
          No page selected
        </div>
      )}

      {contextMenu && (
        <PageContextMenu
          pageId={contextMenu.pageId}
          x={contextMenu.x}
          y={contextMenu.y}
          isDefault={contextMenu.pageId === defaultPageId}
          isVisible={pages.find((p) => p.id === contextMenu.pageId)?.visible ?? true}
          canDelete={pages.length > 1}
          onClose={() => {
            setContextMenu(null)
          }}
          onDuplicate={() => {
            duplicatePage(contextMenu.pageId)
          }}
          onSaveAsTemplate={() => {
            setSaveTemplatePageId(contextMenu.pageId)
          }}
          onSetDefault={() => {
            setDefaultPage(contextMenu.pageId)
          }}
          onToggleVisible={() => {
            const page = pages.find((p) => p.id === contextMenu.pageId)
            if (page) updatePage(contextMenu.pageId, { visible: !page.visible })
          }}
          onDelete={() => {
            deletePage(contextMenu.pageId)
          }}
        />
      )}

      <SaveTemplateDialog
        open={saveTemplatePageId !== null}
        defaultName={
          saveTemplatePageId
            ? `Page ${String(pages.findIndex((p) => p.id === saveTemplatePageId) + 1)}`
            : ''
        }
        onOpenChange={(open) => {
          if (!open) setSaveTemplatePageId(null)
        }}
        onSave={(name) => {
          const page = pages.find((p) => p.id === saveTemplatePageId)
          if (page) saveTemplate(name, page)
        }}
      />
      <ManageTemplatesDialog open={manageOpen} onOpenChange={setManageOpen} />

      <UndoToast />
    </div>
  )
}

export default EditorRoute
