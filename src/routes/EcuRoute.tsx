import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SignalDef } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore } from '../stores/log.store'
import { EcuCatalogueList } from '../components/ecu/EcuCatalogueList'
import { XmlImportZone } from '../components/ecu/XmlImportZone'
import { SignalPreviewTable } from '../components/ecu/SignalPreviewTable'
import { ApplyConfirmDialog } from '../components/ecu/ApplyConfirmDialog'
import { cn } from '@/lib/utils'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RouteBody, RoutePage, RoutePanel } from '../components/ui/route-shell'
import { NoEcuProfileState } from '../components/states/NoEcuProfileState'
import { prettyProfileKey } from '../utils/profile-key'
import { useEcuSource } from '../hooks/useEcuSource'

const EcuRoute = () => {
  const activeProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const activeSignals = useSignalStore((s) => s.signals)
  const currentSignalCount = activeSignals.length
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const dashboardConfig = useDashboardStore((s) => s.config)
  const log = useLogStore((s) => s.push)

  const { source, importError, setImportError, selectCatalogueItem, loadImport, clear } =
    useEcuSource()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)

  const previewSignals = useMemo<SignalDef[]>(() => {
    switch (source.kind) {
      case 'none':
        return []
      case 'import':
      case 'catalogue':
        return source.signals
    }
  }, [source])

  const shownSignals = source.kind === 'none' ? activeSignals : previewSignals

  const boundTo = useMemo(() => {
    const map = new Map<string, string>()
    const pages = dashboardConfig?.pages ?? []
    pages.forEach((page, pageIndex) => {
      for (const widget of page.widgets) {
        if (widget.signal.length > 0 && !map.has(widget.signal)) {
          map.set(widget.signal, `Page ${String(pageIndex + 1)} · ${widget.type}`)
        }
      }
    })
    return map
  }, [dashboardConfig])

  const boundCount = useMemo(
    () => shownSignals.filter((s) => boundTo.has(s.name)).length,
    [shownSignals, boundTo]
  )

  const previewWarnings =
    source.kind === 'import' || source.kind === 'catalogue' ? source.warnings : []

  const targetName = useMemo(() => {
    switch (source.kind) {
      case 'none':
        return ''
      case 'import':
        return source.fileName
      case 'catalogue':
        return `${source.vendor} · ${source.label}`
    }
  }, [source])

  const selectedItemId = source.kind === 'catalogue' ? source.itemId : null

  const selectedKey = (() => {
    switch (source.kind) {
      case 'none':
        return ''
      case 'catalogue':
        return `catalogue:${source.itemId}`
      case 'import':
        return `import:${source.fileName}`
    }
  })()

  const canApply = previewSignals.length > 0

  const hasNothingToShow = shownSignals.length === 0 && previewWarnings.length === 0

  const onConfirmApply = () => {
    setConfirmOpen(false)
    applyProfile(selectedKey, previewSignals)
    log('success', `Applied "${targetName}" — ${String(previewSignals.length)} signals`)
  }

  const summary =
    source.kind === 'none'
      ? `${prettyProfileKey(activeProfileKey)} · ${String(currentSignalCount)} signals · ${String(boundCount)} bound`
      : `preview — ${targetName} · ${String(previewSignals.length)} signals · ${String(boundCount)} bound`

  return (
    <RoutePage>
      <RouteHeader
        title="ECU profile"
        subtitle={summary}
        action={
          <button
            type="button"
            className={cn(
              'shell-burn-button border-none px-4 py-1.5 text-[11px] font-extrabold tracking-[0.09em]',
              canApply
                ? 'cursor-pointer bg-brand-accent text-brand-ground'
                : 'cursor-not-allowed bg-brand-neutral-300 text-brand-neutral-500'
            )}
            disabled={!canApply}
            onClick={() => {
              setConfirmOpen(true)
            }}
          >
            APPLY PROFILE
          </button>
        }
      />

      <RouteBody>
        <section className="flex w-[250px] min-h-0 shrink-0 flex-col overflow-hidden border-r-2 border-brand-divider">
          <RoutePanel>
            <EcuCatalogueList
              searchRef={searchRef}
              activeKey={activeProfileKey}
              selectedId={selectedItemId}
              onSelect={(item) => {
                void selectCatalogueItem(item)
              }}
            />
          </RoutePanel>
          <div className="flex flex-col gap-2 border-t-2 border-brand-divider px-[18px] py-3">
            <XmlImportZone
              loadedFileName={source.kind === 'import' ? source.fileName : null}
              onFileLoad={loadImport}
              onError={setImportError}
              onClear={clear}
            />
            {importError && (
              <div className="border border-brand-accent bg-[color-mix(in_srgb,hsl(var(--brand-accent))_8%,transparent)] px-2.5 py-2 text-xs text-brand-accent">
                {importError}
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {hasNothingToShow ? (
            <NoEcuProfileState
              className="mx-7 my-[26px] max-w-[560px]"
              onPickProfile={() => searchRef.current?.focus()}
              onCaptureBus={() => {
                void navigate('/can')
              }}
            />
          ) : (
            <SignalPreviewTable
              signals={shownSignals}
              boundTo={boundTo}
              warnings={previewWarnings}
            />
          )}
        </section>
      </RouteBody>

      <ApplyConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        targetName={targetName}
        newSignalCount={previewSignals.length}
        currentSignalCount={currentSignalCount}
        onConfirm={onConfirmApply}
      />
    </RoutePage>
  )
}

export default EcuRoute
