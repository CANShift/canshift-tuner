import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { PageConfig, ScreenProfileId } from '@canshift/core'
import {
  DEFAULT_PAGE_PALETTE,
  FIRMWARE_CAPS,
  HexColorSchema,
  SCREEN_PROFILES,
  resolveScreenProfile,
} from '@canshift/core'
import { DashToolbar } from '../components/editor/DashToolbar'
import { ZoomControl, ZOOM_STEPS } from '../components/editor/ZoomControl'
import { useSignalStore } from '../stores/signal.store'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { useProjectStore } from '../stores/project/project.store'
import { PROJECT_FILE_ACCEPT } from '../lib/project-file'
import { ecuLabelForKey } from '../utils/ecu-label'
import { buildWidget, DEFAULT_NEW_WIDGET } from '../lib/new-widget'
import { useCatalogueIndex } from '../hooks/useCatalogueIndex'
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

  const {
    selectPage,
    addPage,
    addWidget,
    duplicatePage,
    removePage,
    setDefaultPage,
    movePage,
    updatePage,
    setTargetProfile,
    undo,
  } = useDashboardStore(
    useShallow((s) => ({
      selectPage: s.selectPage,
      addPage: s.addPage,
      addWidget: s.addWidget,
      duplicatePage: s.duplicatePage,
      removePage: s.removePage,
      setDefaultPage: s.setDefaultPage,
      movePage: s.movePage,
      updatePage: s.updatePage,
      setTargetProfile: s.setTargetProfile,
      undo: s.undo,
    }))
  )

  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const canUndo = useDashboardStore((s) => s.past.length > 0)
  const undoLabel = useDashboardStore((s) => s.past[s.past.length - 1]?.label)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const catalogue = useCatalogueIndex()
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const configName = useDashboardStore((s) => s.config?.name ?? 'config')
  const { fileInputRef, exportProjectFile, openImportPicker, handleImportChange } =
    useProjectFileActions()
  const [zoom, setZoom] = useState(1)

  const stepZoom = useCallback((direction: 1 | -1) => {
    setZoom((current) => {
      const steps: readonly number[] = ZOOM_STEPS
      const index = steps.indexOf(current)
      const base = index === -1 ? steps.indexOf(1) : index
      return steps[Math.max(0, Math.min(steps.length - 1, base + direction))] ?? current
    })
  }, [])

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

  const screenProfile = resolveScreenProfile(targetProfile)
  const widgetCount = pages.reduce((total, p) => total + p.widgets.length, 0)

  const toolbar = currentPage ? (
    <DashToolbar
      pages={pages.map((p, index) => ({
        id: p.id,
        label: `PAGE ${String(index + 1)}`,
        isBoot: p.id === defaultPageId,
      }))}
      selectedPageId={currentPage.id}
      onSelectPage={selectPage}
      onAddPage={() => {
        if (!atCap) addPage(buildBlankPage())
      }}
      onSetBoot={() => {
        setDefaultPage(currentPage.id)
      }}
      onDuplicatePage={() => {
        if (!atCap) duplicatePage(currentPage.id)
      }}
      onMovePageEarlier={() => {
        movePage(currentPageIndex, currentPageIndex - 1)
      }}
      onMovePageLater={() => {
        movePage(currentPageIndex, currentPageIndex + 1)
      }}
      onUndo={undo}
      onDeletePage={() => {
        deletePage(currentPage.id)
      }}
      canAddPage={!atCap}
      isBootPage={currentPage.id === defaultPageId}
      canMoveEarlier={currentPageIndex > 0}
      canMoveLater={currentPageIndex >= 0 && currentPageIndex < pages.length - 1}
      canUndo={canUndo}
      undoLabel={undoLabel}
      canDeletePage={pages.length > 1}
      panels={SCREEN_PROFILES.map((profile) => ({ id: profile.id, label: profile.name }))}
      selectedPanelId={screenProfile.id}
      onSelectPanel={(id) => {
        setTargetProfile(id as ScreenProfileId)
      }}
      pageMeta={`${String(screenProfile.width)} × ${String(screenProfile.height)} · ${String(widgetCount)} widgets`}
      profileMeta={ecuLabelForKey(selectedProfileKey, catalogue)}
      onAddWidget={() => {
        addWidget(currentPage.id, buildWidget(DEFAULT_NEW_WIDGET))
      }}
      onImport={openImportPicker}
      onExport={() => {
        exportProjectFile(activeProjectId, configName)
      }}
      extras={
        <ZoomControl
          zoom={zoom}
          onStep={stepZoom}
          onReset={() => {
            setZoom(1)
          }}
        />
      }
    />
  ) : null

  return (
    <div className="flex flex-1 overflow-hidden">
      {currentPage ? (
        <ErrorBoundary scope="canvas">
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              page={currentPage}
              topBar={topBar}
              pageIndex={currentPageIndex >= 0 ? currentPageIndex : undefined}
              zoom={zoom}
              onZoomStep={stepZoom}
              toolbar={toolbar}
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

      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_FILE_ACCEPT}
        onChange={(event) => {
          void handleImportChange(event)
        }}
        className="hidden"
      />

      <UndoToast />
    </div>
  )
}

export default EditorRoute
