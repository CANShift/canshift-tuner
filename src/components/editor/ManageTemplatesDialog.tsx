import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTemplateStore } from '../../stores/template/template.store'
import type { PageTemplateEntry } from '../../stores/template/storage'
import { PAGE_TEMPLATE_NAME_MAX } from '../../lib/page-template'

export interface ManageTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TemplateRowProps {
  entry: PageTemplateEntry
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

const TemplateRow = ({ entry, onRename, onDelete }: TemplateRowProps) => {
  const [value, setValue] = useState(entry.name)

  const commit = () => {
    if (value.trim().length > 0 && value.trim() !== entry.name) onRename(entry.id, value.trim())
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
        maxLength={PAGE_TEMPLATE_NAME_MAX}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onDelete(entry.id)
        }}
      >
        Delete
      </Button>
    </div>
  )
}

export const ManageTemplatesDialog = ({ open, onOpenChange }: ManageTemplatesDialogProps) => {
  const templates = useTemplateStore((s) => s.templates)
  const renameTemplate = useTemplateStore((s) => s.renameTemplate)
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage page templates</DialogTitle>
          <DialogDescription>
            Rename or delete the templates saved on this browser.
          </DialogDescription>
        </DialogHeader>
        {templates.length === 0 ? (
          <p className="text-sm text-ui-muted">No templates yet.</p>
        ) : (
          <div className="grid gap-2">
            {templates.map((entry) => (
              <TemplateRow
                key={entry.id}
                entry={entry}
                onRename={renameTemplate}
                onDelete={deleteTemplate}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
