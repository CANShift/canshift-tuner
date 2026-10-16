import type { HistoryEntry } from './helpers'
import type { StateCreator } from 'zustand'
import type {
  CriticalAlert,
  DashboardConfig,
  PageConfig,
  PageTemplate,
  ThemePreset,
  UnitSystem,
  Widget,
} from '@canshift/core'

export interface LifecycleSlice {
  config: DashboardConfig | null
  lastSavedAt: number | null

  setConfig: (config: DashboardConfig) => void
  replaceConfig: (config: DashboardConfig, label: string) => void
  setUnits: (units: UnitSystem) => void
  setCriticalAlert: (alert: CriticalAlert | null) => void
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
}

export interface WidgetsSlice {
  addWidget: (pageId: string, widget: Widget) => void
  removeWidget: (pageId: string, widgetId: string) => void
  updateWidget: (pageId: string, widgetId: string, patch: Partial<Widget>) => void
}

export interface DashboardState
  extends LifecycleSlice, HistorySlice, PagesSlice, ThemeSlice, SelectionSlice, WidgetsSlice {}

export type SliceCreator<T> = StateCreator<DashboardState, [['zustand/immer', never]], [], T>
