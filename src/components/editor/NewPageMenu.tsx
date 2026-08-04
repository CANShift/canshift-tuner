import type { CSSProperties } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTemplateStore } from '../../stores/template/template.store'
import type { PageTemplateEntry } from '../../stores/template/storage'

export interface NewPageMenuProps {
  atCap: boolean
  onAddBlank: () => void
  onInsertTemplate: (entry: PageTemplateEntry) => void
  onManage: () => void
}

export const NewPageMenu = ({
  atCap,
  onAddBlank,
  onInsertTemplate,
  onManage,
}: NewPageMenuProps) => {
  const templates = useTemplateStore((s) => s.templates)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title="Add a new page" style={triggerStyle}>
          + PAGE
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          disabled={atCap}
          onSelect={() => {
            onAddBlank()
          }}
        >
          Blank page
        </DropdownMenuItem>
        {templates.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>From template</DropdownMenuLabel>
            <DropdownMenuGroup>
              {templates.map((entry) => (
                <DropdownMenuItem
                  key={entry.id}
                  disabled={atCap}
                  onSelect={() => {
                    onInsertTemplate(entry)
                  }}
                >
                  <span className="truncate">{entry.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                onManage()
              }}
            >
              Manage templates…
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const triggerStyle: CSSProperties = {
  width: 92,
  flexShrink: 0,
  background: 'none',
  border: 0,
  borderRight: '1px solid hsl(var(--brand-neutral-300))',
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: '0.06em',
  color: 'hsl(var(--brand-neutral-700))',
  cursor: 'pointer',
}
