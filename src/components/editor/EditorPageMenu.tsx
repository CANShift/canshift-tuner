import { FIRMWARE_CAPS } from '@canshift/core'
import { PageContextMenu } from '../../routes/PageContextMenu'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useTemplateStore } from '../../stores/template/template.store'
import { instantiateTemplate } from '../../lib/page-template'

export interface PageMenuAnchor {
  pageId: string
  x: number
  y: number
}

export interface EditorPageMenuProps {
  anchor: PageMenuAnchor
  onClose: () => void
  onDeletePage: (pageId: string) => void
  onSaveAsTemplate: (pageId: string) => void
  onManageTemplates: () => void
}

const usePageMenuState = (pageId: string) => {
  const pages = useDashboardStore((s) => s.config?.pages ?? [])
  const defaultPageId = useDashboardStore((s) => s.config?.defaultPageId)
  const page = pages.find((candidate) => candidate.id === pageId)
  return {
    isDefault: pageId === defaultPageId,
    isVisible: page?.visible ?? true,
    canDelete: pages.length > 1,
    atCap: pages.length >= FIRMWARE_CAPS.MAX_PAGES,
  }
}

const useInsertTemplate = (atCap: boolean) => {
  const templates = useTemplateStore((s) => s.templates)
  const insert = (templateId: string) => {
    const entry = templates.find((candidate) => candidate.id === templateId)
    if (entry && !atCap) useDashboardStore.getState().addPage(instantiateTemplate(entry))
  }
  return { templates, insert }
}

export const EditorPageMenu = ({
  anchor,
  onClose,
  onDeletePage,
  onSaveAsTemplate,
  onManageTemplates,
}: EditorPageMenuProps) => {
  const { pageId } = anchor
  const state = usePageMenuState(pageId)
  const { templates, insert } = useInsertTemplate(state.atCap)
  const { duplicatePage, setDefaultPage, updatePage } = useDashboardStore.getState()

  return (
    <PageContextMenu
      {...anchor}
      isDefault={state.isDefault}
      isVisible={state.isVisible}
      canDelete={state.canDelete}
      onClose={onClose}
      onDuplicate={() => duplicatePage(pageId)}
      onSaveAsTemplate={() => onSaveAsTemplate(pageId)}
      onSetDefault={() => setDefaultPage(pageId)}
      onToggleVisible={() => updatePage(pageId, { visible: !state.isVisible })}
      onDelete={() => onDeletePage(pageId)}
      templates={templates}
      onInsertTemplate={insert}
      onManageTemplates={onManageTemplates}
    />
  )
}
