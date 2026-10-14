import { SidebarWidgetList } from '../components/editor/sidebar/SidebarWidgetList'
import { SidebarSelectedEditor } from '../components/editor/sidebar/SidebarSelectedEditor'
import { SidebarFooter } from '../components/editor/sidebar/SidebarFooter'
import { AdvancedProperties } from '../components/editor/sidebar/AdvancedProperties'
import { ThemeSection } from '../components/themes/ThemeSection'
import { useDashboardStore } from '../stores/dashboard.store'

const ASIDE =
  'flex w-full shrink-0 flex-col border-t-2 border-ui-rule bg-ui-bg md:w-[356px] md:overflow-hidden md:border-l-2 md:border-t-0'

export interface RightSidebarProps {
  pageId: string | undefined
}

const usePageWidgets = (pageId: string | undefined) =>
  useDashboardStore((s) => s.config?.pages.find((page) => page.id === pageId)?.widgets)

export const RightSidebar = ({ pageId }: RightSidebarProps) => {
  const widgets = usePageWidgets(pageId)
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  if (widgets === undefined || pageId === undefined) return <aside className={ASIDE} />

  const selected = widgets.find((widget) => widget.id === selectedWidgetId) ?? null

  return (
    <aside className={ASIDE}>
      <SidebarWidgetList pageId={pageId} widgets={widgets} />
      {selected !== null && (
        <SidebarSelectedEditor pageId={pageId} widgets={widgets} selected={selected} />
      )}
      <SidebarFooter pageId={pageId} selected={selected} />
      <AdvancedProperties pageId={pageId} />
      <ThemeSection />
    </aside>
  )
}
