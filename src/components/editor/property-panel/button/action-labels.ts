import type { ButtonAction } from '@canshift/core'

export const ACTION_TYPE_LABELS: Record<ButtonAction['type'], string> = {
  navigate: 'Navigate',
  map_switch: 'Map Switch',
  can_raw: 'CAN Raw',
  cruise_control: 'Cruise Ctrl',
  timer_control: 'Timer',
}

export const ACTION_CATEGORY_COLORS: Record<ButtonAction['category'], string> = {
  ecu: '#CC8800',
  dashboard: '#5577CC',
  device: '#5577CC',
}
