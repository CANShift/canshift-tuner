import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PAGE_TEMPLATE_NAME_MAX } from '../../lib/page-template'

export interface SaveTemplateDialogProps {
  open: boolean
  defaultName: string
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
}

export const SaveTemplateDialog = ({
  open,
  defaultName,
  onOpenChange,
  onSave,
}: SaveTemplateDialogProps) => {
  const [name, setName] = useState(defaultName)

  useEffect(() => {
    if (open) setName(defaultName)
  }, [open, defaultName])

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave(name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Templates are stored on this browser and offered when adding a page to any project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
            maxLength={PAGE_TEMPLATE_NAME_MAX}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
