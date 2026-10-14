import { lazy, Suspense, useState } from 'react'
import { RouteLoading } from '../../shell/RouteLoading'

const PropertyPanel = lazy(() => import('../PropertyPanel'))

const TOGGLE =
  'w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left font-mono text-[11px] text-ui-muted hover:text-ui-ink'

export const AdvancedProperties = ({ pageId }: { pageId: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="shrink-0 border-t border-ui-line">
      <button type="button" onClick={() => setOpen((current) => !current)} className={TOGGLE}>
        {open ? 'Hide the full properties' : 'Colours, size, per-type config…'}
      </button>
      {open && (
        <div className="max-h-[280px] overflow-y-auto border-t border-ui-line">
          <Suspense fallback={<RouteLoading />}>
            <PropertyPanel pageId={pageId} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
