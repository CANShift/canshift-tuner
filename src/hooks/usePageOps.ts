import { useShallow } from 'zustand/react/shallow'
import { DEFAULT_PAGE_PALETTE, FIRMWARE_CAPS, HexColorSchema } from '@canshift/core'
import type { PageConfig } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { createId } from '../utils/id'
import type { PageOps } from '../components/editor/toolbar/PageOpsCluster'

const NEW_PAGE_BG = HexColorSchema.parse('#000000')

export const buildBlankPage = (): PageConfig => ({
  id: createId('page'),
  backgroundImage: null,
  backgroundColor: NEW_PAGE_BG,
  palette: { ...DEFAULT_PAGE_PALETTE },
  showTopBar: true,
  visible: true,
  widgets: [],
})

const usePageActions = () =>
  useDashboardStore(
    useShallow((s) => ({
      addPage: s.addPage,
      duplicatePage: s.duplicatePage,
      setDefaultPage: s.setDefaultPage,
      movePage: s.movePage,
    }))
  )

type PageActions = ReturnType<typeof usePageActions>

interface PagePosition {
  pageId: string
  index: number
  canAdd: boolean
}

const pageHandlers = (
  actions: PageActions,
  { pageId, index, canAdd }: PagePosition,
  onDeletePage: (pageId: string) => void
) => ({
  onAdd: () => {
    if (canAdd) actions.addPage(buildBlankPage())
  },
  onSetBoot: () => {
    actions.setDefaultPage(pageId)
  },
  onDuplicate: () => {
    if (canAdd) actions.duplicatePage(pageId)
  },
  onMoveEarlier: () => {
    actions.movePage(index, index - 1)
  },
  onMoveLater: () => {
    actions.movePage(index, index + 1)
  },
  onDelete: () => {
    onDeletePage(pageId)
  },
})

export const usePageOps = (
  pages: readonly PageConfig[],
  pageId: string,
  onDeletePage: (pageId: string) => void
): PageOps => {
  const actions = usePageActions()
  const defaultPageId = useDashboardStore((s) => s.config?.defaultPageId)
  const index = pages.findIndex((page) => page.id === pageId)
  const canAdd = pages.length < FIRMWARE_CAPS.MAX_PAGES
  return {
    ...pageHandlers(actions, { pageId, index, canAdd }, onDeletePage),
    canAdd,
    isBoot: pageId === defaultPageId,
    canMoveEarlier: index > 0,
    canMoveLater: index >= 0 && index < pages.length - 1,
    canDelete: pages.length > 1,
  }
}
