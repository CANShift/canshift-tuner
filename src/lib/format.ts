const SIGNAL_DECIMALS = 1
const NO_SIGNAL_VALUE = '—'

export const formatSignalValue = (value: number | undefined): string => {
  if (value === undefined) return NO_SIGNAL_VALUE
  return Number.isInteger(value) ? String(value) : value.toFixed(SIGNAL_DECIMALS)
}
