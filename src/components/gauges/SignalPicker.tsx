import { useMemo, useState } from 'react'
import type { SignalDef } from '@canshift/core'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { useSignalStore } from '../../stores/signal.store'
import { useLiveReadings, type LiveReading } from '../../hooks/useLiveReading'
import { LiveValue } from './LiveValue'

export interface SignalPickerProps {
  open: boolean
  current: string
  onOpenChange: (open: boolean) => void
  onPick: (signal: string) => void
}

const matches = (signal: SignalDef, query: string): boolean => {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return true
  return `${signal.name} ${signalName(signal.name)} ${signal.unit}`.toLowerCase().includes(needle)
}

interface SignalRowProps {
  signal: SignalDef
  current: boolean
  reading: LiveReading
  onPick: (signal: string) => void
}

const SignalRow = ({ signal, current, reading, onPick }: SignalRowProps) => (
  <li>
    <button
      type="button"
      aria-current={current}
      onClick={() => {
        onPick(signal.name)
      }}
      className="flex min-h-[52px] w-full items-center gap-3 border-b border-app-divider px-3.5 py-2 text-left aria-[current=true]:bg-app-surface-2"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px]">{signalName(signal.name)}</span>
        <span className="font-num text-xs text-app-muted">{signal.name}</span>
      </span>
      <LiveValue reading={reading} />
    </button>
  </li>
)

interface SignalListProps {
  query: string
  current: string
  onPick: (signal: string) => void
}

const SignalList = ({ query, current, onPick }: SignalListProps) => {
  const signals = useSignalStore((s) => s.signals)
  const reading = useLiveReadings()
  const shown = useMemo(() => signals.filter((signal) => matches(signal, query)), [signals, query])
  if (shown.length === 0) {
    return <p className="px-1 text-sm text-app-muted">{STRINGS.gauges.noSignalMatch}</p>
  }
  return (
    <ul className="flex flex-col overflow-y-auto rounded-[12px] border border-app-border bg-app-bg">
      {shown.map((signal) => (
        <SignalRow
          key={signal.name}
          signal={signal}
          current={signal.name === current}
          reading={reading(signal.name)}
          onPick={onPick}
        />
      ))}
    </ul>
  )
}

const SearchInput = ({ query, onQuery }: { query: string; onQuery: (query: string) => void }) => (
  <Input
    type="search"
    autoFocus
    value={query}
    placeholder={STRINGS.gauges.searchSignals}
    aria-label={STRINGS.gauges.searchSignals}
    onChange={(event) => {
      onQuery(event.target.value)
    }}
  />
)

export const SignalPicker = ({ open, current, onOpenChange, onPick }: SignalPickerProps) => {
  const [query, setQuery] = useState('')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        className="max-h-[85dvh] lg:max-h-[calc(100dvh-7rem)]"
      >
        <SheetTitle className="text-[21px] font-bold lg:text-lg">{STRINGS.gauges.shows}</SheetTitle>
        <SearchInput query={query} onQuery={setQuery} />
        <SignalList
          query={query}
          current={current}
          onPick={(signal) => {
            onPick(signal)
            onOpenChange(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
