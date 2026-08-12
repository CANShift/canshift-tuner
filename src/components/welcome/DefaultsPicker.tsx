import { useMemo } from 'react'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { benchPreviewOfPage } from '../../lib/bench-entry'
import { BENCH_ROW } from './BenchRow'
import { ConfigThumbnail } from './ConfigThumbnail'

export interface DefaultsPickerProps {
  onStartFromPageSet: (pageSetId: string) => void
}

const DEFAULT_PAGE_COUNT = 1

const prettify = (id: string): string => id.charAt(0).toUpperCase() + id.slice(1)

export const DefaultsPicker = ({ onStartFromPageSet }: DefaultsPickerProps) => {
  const defaults = useMemo(
    () =>
      DEFAULT_SIM_CONFIG.pages.map((page) => ({
        id: page.id,
        label: prettify(page.id),
        widgetCount: page.widgets.length,
        preview: benchPreviewOfPage(page),
      })),
    []
  )

  return (
    <>
      {defaults.map((option) => (
        <button
          key={option.id}
          type="button"
          className={BENCH_ROW}
          onClick={() => {
            onStartFromPageSet(option.id)
          }}
        >
          <ConfigThumbnail
            theme={option.preview.theme}
            kicker={option.preview.kicker}
            pageCount={DEFAULT_PAGE_COUNT}
          />
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[15.5px] font-extrabold text-brand-text">{option.label}</span>
            <span className="font-mono text-[11.5px] leading-[1.5] text-brand-neutral-600">
              {option.widgetCount} widgets · one page to start from
            </span>
          </span>
          <span className="font-mono text-[11.5px] whitespace-nowrap text-brand-accent">
            START →
          </span>
        </button>
      ))}
    </>
  )
}
