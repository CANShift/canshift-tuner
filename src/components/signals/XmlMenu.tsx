import { useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SIGNALS_ACTION_CLASS } from './SignalsToolbar'

export interface XmlMenuProps {
  accept: string
  onImport: (file: File) => void
  onDownload: () => void
}

export const XmlMenu = ({ accept, onImport, onDownload }: XmlMenuProps) => {
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={SIGNALS_ACTION_CLASS}>XML ▾</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
            Import XML…
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDownload}>Download XML</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImport(file)
          e.target.value = ''
        }}
      />
    </>
  )
}
