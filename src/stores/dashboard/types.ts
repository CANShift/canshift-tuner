import type { HistoryEntry } from './helpers'
import type { StateCreator } from 'zustand'
import type {
  CriticalAlert,
  DashboardConfig,
  PageButtonRole,
  PageConfig,
  PageTemplate,
  ThemePreset,
  TopBarItem,
  UnitSystem,
  Widget,
  WidgetLayout,
} from '@canshift/core'
import type { WidgetPatch } from '../../lib/widget-patch'
import type { StatusSlot } from '../../lib/status-row'

export interface LifecycleSlice {
  config: DashboardConfig | null
  lastSavedAt: number | null

  setConfig: (config: DashboardConfig) => void
  replaceConfig: (config: DashboardConfig, label: string) => void
  setUnits: (units: UnitSystem) => void
  addCriticalAlert: (alert: CriticalAlert) => void
  updateCriticalAlert: (index: number, alert: CriticalAlert) => void
  removeCriticalAlert: (index: number) => void
  setPageButton: (role: PageButtonRole, signal: string | null) => void
  markAutosaved: (ts: number) => void
}

export interface HistorySlice {
  past: HistoryEntry[]
  future: HistoryEntry[]
  undo: () => void
  redo: () => void
}

export interface PagesSlice {
  addPage: (page: PageConfig) => void
  removePage: (pageId: string) => void
  setPageTemplate: (pageId: string, template: PageTemplate) => void
  movePage: (fromIndex: number, toIndex: number) => void
  setStatusItem: (pageId: string, slot: StatusSlot, item: TopBarItem | null) => void
}

export interface ThemeSlice {
  setTheme: (theme: ThemePreset | null) => void
}

export interface SelectionSlice {
  selectedPageId: string | null
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
  selectPage: (pageId: string | null) => void
  selectWidget: (widgetId: string | null) => void
  toggleWidgetSelection: (widgetId: string) => void
}

export interface WidgetsSlice {
  addWidget: (pageId: string, widget: Widget) => void
  removeWidget: (pageId: string, widgetId: string) => void
  updateWidget: (pageId: string, widgetId: string, patch: WidgetPatch) => void
  moveWidget: (pageId: string, widgetId: string, layout: Partial<WidgetLayout>) => void
  moveWidgets: (pageId: string, moves: { id: string; col: number; row: number }[]) => void
  resolveWidgetCollisions: (pageId: string, widgetId: string) => void
  beginDrag: (pageId: string, widgetIds: string[]) => void
  nudgeWidgets: (pageId: string, widgetIds: string[], step: { cols: number; rows: number }) => void
  resizeWidgets: (pageId: string, widgetIds: string[], step: { cols: number; rows: number }) => void
}

export interface ClipboardSlice {
  clipboardWidgets: Widget[]
  copyWidgets: (pageId: string, widgetIds: string[]) => void
  pasteWidgets: (pageId: string) => void
  removeWidgets: (pageId: string, widgetIds: string[]) => void
}

export interface DashboardState
  extends
    LifecycleSlice,
    HistorySlice,
    PagesSlice,
    ThemeSlice,
    SelectionSlice,
    WidgetsSlice,
    ClipboardSlice {}

export type SliceCreator<T> = StateCreator<DashboardState, [['zustand/immer', never]], [], T>
