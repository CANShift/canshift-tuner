export const PREVIEW_MODES = ['normal', 'cut', 'splash', 'alert'] as const

export type PreviewMode = (typeof PREVIEW_MODES)[number]

export const PREVIEW_LABELS: Record<PreviewMode, string> = {
  normal: 'NORMAL',
  cut: 'CUT',
  splash: 'SPLASH',
  alert: 'ALERT',
}

export const CS_WARN = '#FF8800'
export const CS_DANGER = '#FF4444'
export const CS_ENGAGED = '#FF4747'
