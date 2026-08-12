import { useEffect, useMemo, useState } from 'react'
import { cva } from 'class-variance-authority'
import { formatBytes } from '../../lib/format'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { TogglePill } from '../ui/toggle-pill'
import { RoutePanel } from '../ui/route-shell'
import { Eyebrow, MetaText } from '../ui/meta-text'
import { errorMessage } from '../../lib/error-message'

export interface CatalogueItem {
  id: string
  vendor: string
  file: string
  label: string
  path: string
  sizeBytes: number
}

interface XmlManifest {
  source: string
  license: string
  fetchedAt: string
  entries: CatalogueItem[]
}

export interface EcuCatalogueListProps {
  activeKey: string
  selectedId: string | null
  onSelect: (item: CatalogueItem) => Promise<void> | void
}

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; manifest: XmlManifest }
  | { kind: 'error'; message: string }

type SortKey = 'vendor' | 'label' | 'size'

const CATALOGUE_URL = '/ecu-catalogue/index.json'

export const EcuCatalogueList = ({ activeKey, selectedId, onSelect }: EcuCatalogueListProps) => {
  const [state, setState] = useState<LoadState>({ kind: 'idle' })
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('vendor')

  useEffect(() => {
    setState({ kind: 'loading' })
    let cancelled = false
    void fetch(CATALOGUE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
        return res.json() as Promise<XmlManifest>
      })
      .then((manifest) => {
        if (cancelled) return
        setState({ kind: 'ready', manifest })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({
          kind: 'error',
          message: errorMessage(err, 'fetch_failed'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (state.kind !== 'ready') return []
    const q = query.trim().toLowerCase()
    const matches = q
      ? state.manifest.entries.filter(
          (e) =>
            e.vendor.toLowerCase().includes(q) ||
            e.label.toLowerCase().includes(q) ||
            e.file.toLowerCase().includes(q)
        )
      : state.manifest.entries.slice()
    matches.sort((a, b) => {
      switch (sortKey) {
        case 'vendor':
          return a.vendor.localeCompare(b.vendor) || a.label.localeCompare(b.label)
        case 'label':
          return a.label.localeCompare(b.label)
        case 'size':
          return b.sizeBytes - a.sizeBytes
      }
    })
    return matches
  }, [state, query, sortKey])

  return (
    <RoutePanel className="gap-2">
      <Eyebrow className="block border-b-2 border-brand-divider px-[18px] py-3">PROFILES</Eyebrow>
      <div className="flex flex-col gap-2 px-[18px]">
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
          placeholder="Search vendor or model"
          className="h-9 text-xs"
          disabled={state.kind !== 'ready'}
        />
        <div className="flex gap-1">
          <TogglePill active={sortKey === 'vendor'} onClick={() => setSortKey('vendor')}>
            Vendor
          </TogglePill>
          <TogglePill active={sortKey === 'label'} onClick={() => setSortKey('label')}>
            Name
          </TogglePill>
          <TogglePill active={sortKey === 'size'} onClick={() => setSortKey('size')}>
            Size
          </TogglePill>
        </div>
      </div>

      {state.kind === 'loading' && (
        <div className="px-[18px] py-3 text-[12px] text-brand-neutral-500">Loading catalogue…</div>
      )}
      {state.kind === 'error' && (
        <div className="mx-[18px] border border-brand-accent bg-[color-mix(in_srgb,hsl(var(--brand-accent))_8%,transparent)] p-2.5 text-[12px] text-brand-accent">
          Failed to load catalogue: {state.message}
        </div>
      )}

      {state.kind === 'ready' && (
        <>
          <div className="px-[18px] text-[10px] uppercase tracking-[0.06em] text-brand-neutral-500">
            {filtered.length} of {state.manifest.entries.length} entr
            {state.manifest.entries.length === 1 ? 'y' : 'ies'} ·{' '}
            <a
              href={state.manifest.source}
              target="_blank"
              rel="noreferrer"
              className="text-brand-neutral-600 underline"
            >
              upstream
            </a>{' '}
            · {state.manifest.license}
          </div>
          <div
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            role="listbox"
            aria-label="ECU catalogue"
          >
            {filtered.map((item) => {
              const isSelected = selectedId === item.id
              const isActive = activeKey === `catalogue:${item.id}`
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    void onSelect(item)
                  }}
                  className={cn(item_({ selected: isSelected }))}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px]">{item.label}</span>
                    {isActive && (
                      <span className="border border-brand-accent px-1.5 py-px text-[9px] font-extrabold uppercase tracking-[0.08em] text-brand-accent">
                        active
                      </span>
                    )}
                  </div>
                  <MetaText
                    size="sm"
                    className="flex justify-between font-normal uppercase tracking-[0.04em] text-brand-neutral-500"
                  >
                    <span>{item.vendor}</span>
                    <span className="text-text-muted">{formatBytes(item.sizeBytes)}</span>
                  </MetaText>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-[18px] py-6 text-center text-[12px] text-brand-neutral-500">
                No catalogue entry matches the current search.
              </div>
            )}
          </div>
        </>
      )}
    </RoutePanel>
  )
}

const item_ = cva(
  [
    'flex cursor-pointer flex-col gap-0.5 border-none px-[18px] py-[11px] text-left font-[inherit]',
    'border-b border-solid border-b-brand-neutral-300',
  ].join(' '),
  {
    variants: {
      selected: {
        true: 'bg-brand-neutral-200 font-extrabold text-brand-text shadow-[inset_3px_0_0_hsl(var(--brand-accent))]',
        false: 'bg-transparent font-normal text-brand-neutral-700',
      },
    },
    defaultVariants: { selected: false },
  }
)
