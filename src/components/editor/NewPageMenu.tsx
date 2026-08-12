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

const TRIGGER = [
  'w-[92px] shrink-0 cursor-pointer border-0 border-r border-solid border-brand-neutral-300',
  'bg-transparent text-[12px] font-extrabold tracking-[0.06em] text-brand-neutral-700',
].join(' ')

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
        <button type="button" title="Add a new page" className={TRIGGER}>
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
