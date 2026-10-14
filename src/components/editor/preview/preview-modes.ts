export const PREVIEW_MODES = ['normal', 'cut', 'splash', 'alert'] as const

export type PreviewMode = (typeof PREVIEW_MODES)[number]

export const PREVIEW_LABELS: Record<PreviewMode, string> = {
  normal: 'Normal',
  cut: 'Cut',
  splash: 'Splash',
  alert: 'Alert',
}

export const PREVIEW_TITLES: Record<PreviewMode, string> = {
  normal: 'The page as it renders',
  cut: 'A protection cut, banded under the status row',
  splash: 'A driver-requested function taking the screen',
  alert: 'The critical alert takeover',
}

export const CS_WARN = '#FF8800'
export const CS_DANGER = '#FF4444'
export const CS_ENGAGED = '#FF4747'
