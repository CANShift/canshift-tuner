import { SaveTemplateDialog } from './SaveTemplateDialog'
import { ManageTemplatesDialog } from './ManageTemplatesDialog'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useTemplateStore } from '../../stores/template/template.store'

export interface TemplateDialogsProps {
  savePageId: string | null
  onCloseSave: () => void
  manageOpen: boolean
  onManageOpenChange: (open: boolean) => void
}

const useSaveDefaultName = (pageId: string | null): string => {
  const pages = useDashboardStore((s) => s.config?.pages ?? [])
  if (pageId === null) return ''
  return `Page ${String(pages.findIndex((page) => page.id === pageId) + 1)}`
}

export const TemplateDialogs = ({
  savePageId,
  onCloseSave,
  manageOpen,
  onManageOpenChange,
}: TemplateDialogsProps) => {
  const saveTemplate = useTemplateStore((s) => s.saveTemplate)
  const defaultName = useSaveDefaultName(savePageId)
  const save = (name: string) => {
    const page = useDashboardStore.getState().config?.pages.find((p) => p.id === savePageId)
    if (page) saveTemplate(name, page)
  }

  return (
    <>
      <SaveTemplateDialog
        open={savePageId !== null}
        defaultName={defaultName}
        onOpenChange={(open) => {
          if (!open) onCloseSave()
        }}
        onSave={save}
      />
      <ManageTemplatesDialog open={manageOpen} onOpenChange={onManageOpenChange} />
    </>
  )
}
