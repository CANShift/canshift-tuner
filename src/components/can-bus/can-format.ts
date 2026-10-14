export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export const hexByte = (value: number): string => value.toString(16).toUpperCase().padStart(2, '0')

export const formatPayload = (bytes: readonly number[], dlc: number): string =>
  bytes.slice(0, dlc).map(hexByte).join(' ')
