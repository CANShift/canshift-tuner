import { describe, expect, it, vi } from 'vitest'
import { menuItems, type PageContextMenuProps } from './PageContextMenu'

const props = (overrides: Partial<PageContextMenuProps> = {}): PageContextMenuProps => ({
  pageId: 'p1',
  x: 0,
  y: 0,
  isDefault: false,
  isVisible: true,
  canDelete: true,
  onClose: vi.fn(),
  onDuplicate: vi.fn(),
  onSaveAsTemplate: vi.fn(),
  onSetDefault: vi.fn(),
  onToggleVisible: vi.fn(),
  onDelete: vi.fn(),
  templates: [],
  onInsertTemplate: vi.fn(),
  onManageTemplates: vi.fn(),
  ...overrides,
})

describe('menuItems', () => {
  it('disables what cannot apply to the page', () => {
    const items = menuItems(props({ isDefault: true, canDelete: false }))
    expect(items.find((i) => i.label === 'Default ★')?.disabled).toBe(true)
    expect(items.find((i) => i.label === 'Delete')).toMatchObject({ danger: true, disabled: true })
    expect(items.find((i) => i.label === 'Manage templates…')?.disabled).toBe(true)
  })

  it('offers one insert entry per saved template', () => {
    const onInsertTemplate = vi.fn()
    const items = menuItems(props({ templates: [{ id: 't1', name: 'Track' }], onInsertTemplate }))
    items.find((i) => i.label === 'Insert “Track”')?.action()
    expect(onInsertTemplate).toHaveBeenCalledWith('t1')
    expect(items.find((i) => i.label === 'Hide page')).toBeDefined()
  })
})
