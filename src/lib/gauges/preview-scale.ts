export interface FitBox {
  width: number
  height: number
}

export const PHONE_PREVIEW_SCALE = 1
export const PREVIEW_VERTICAL_CHROME = 168

const MIN_SCALE = 1
export const MAX_PREVIEW_SCALE = 2

export const fitPreviewScale = (room: FitBox, screen: FitBox): number => {
  const byWidth = Math.floor(room.width / screen.width)
  const byHeight = Math.floor((room.height - PREVIEW_VERTICAL_CHROME) / screen.height)
  return Math.max(MIN_SCALE, Math.min(byWidth, byHeight, MAX_PREVIEW_SCALE))
}
