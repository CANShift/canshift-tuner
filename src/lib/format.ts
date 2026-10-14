export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${String(bytes)} B`
}

const SIGNAL_DECIMALS = 1
const NO_SIGNAL_VALUE = '—'

export const formatSignalValue = (value: number | undefined): string => {
  if (value === undefined) return NO_SIGNAL_VALUE
  return Number.isInteger(value) ? String(value) : value.toFixed(SIGNAL_DECIMALS)
}
