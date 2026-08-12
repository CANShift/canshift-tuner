import type { DragEvent, ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { formatBytes } from '../../lib/format'
import { errorMessage } from '../../lib/error-message'

export interface XmlImportZoneProps {
  loadedFileName: string | null
  onFileLoad: (fileName: string, xml: string) => void
  onError: (message: string) => void
  onClear: () => void
}

const MAX_FILE_BYTES = 2 * 1024 * 1024

export const XmlImportZone = ({
  loadedFileName,
  onFileLoad,
  onError,
  onClear,
}: XmlImportZoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      onError(`"${file.name}" is not a .xml file`)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      onError(
        `"${file.name}" is ${formatBytes(file.size)} — over the ${formatBytes(MAX_FILE_BYTES)} limit`
      )
      return
    }
    void file
      .text()
      .then((text) => {
        onFileLoad(file.name, text)
      })
      .catch((err: unknown) => {
        onError(`Could not read "${file.name}" — ${errorMessage(err)}`)
      })
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const state: ZoneState = dragging ? 'dragging' : loadedFileName !== null ? 'loaded' : 'empty'

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(zone({ state }))}
    >
      <input ref={inputRef} type="file" accept=".xml" onChange={onPick} className="hidden" />
      {loadedFileName ? (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="font-mono text-[12px] text-brand-text">{loadedFileName}</div>
          <button type="button" onClick={onClear} className={CLEAR_BUTTON}>
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-[22px] leading-none text-brand-neutral-500">↓</div>
          <div className="text-[13px] font-extrabold text-brand-text">Drop an XML file here</div>
          <div className="text-[12px] text-brand-neutral-500">or pick a file from disk</div>
          <button type="button" onClick={() => inputRef.current?.click()} className={PICK_BUTTON}>
            Choose file…
          </button>
        </div>
      )}
    </div>
  )
}

type ZoneState = 'dragging' | 'loaded' | 'empty'

const zone = cva(
  [
    'flex items-center justify-center border border-dashed px-4 py-6',
    '[transition:background_100ms_ease,border-color_100ms_ease]',
  ].join(' '),
  {
    variants: {
      state: {
        dragging: 'border-brand-accent bg-brand-accent/[0.06]',
        loaded: 'border-brand-neutral-400 bg-brand-neutral-100',
        empty: 'border-brand-neutral-400 bg-transparent',
      },
    },
    defaultVariants: { state: 'empty' },
  }
)

const PICK_BUTTON = [
  'mt-2 cursor-pointer border-none bg-brand-accent px-[18px] py-2',
  'text-[11px] font-extrabold tracking-[0.09em] text-brand-ground',
].join(' ')

const CLEAR_BUTTON = [
  'cursor-pointer border border-solid border-brand-neutral-400 bg-transparent',
  'px-2.5 py-1 text-[11px] text-brand-neutral-600',
].join(' ')
