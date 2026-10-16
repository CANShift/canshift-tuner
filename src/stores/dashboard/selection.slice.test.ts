import { beforeEach, describe, expect, it } from 'vitest'
import { useDashboardStore } from '../dashboard.store'

const store = () => useDashboardStore.getState()

beforeEach(() => {
  store().selectPage(null)
})

describe('selection', () => {
  it('selects one widget, or clears with null', () => {
    store().selectWidget('a')
    expect([store().selectedWidgetId, store().selectedWidgetIds]).toEqual(['a', ['a']])
    store().selectWidget(null)
    expect([store().selectedWidgetId, store().selectedWidgetIds]).toEqual([null, []])
  })
})
