const NUMERIC = /^\d+$/

const parts = (version: string): number[] =>
  version
    .trim()
    .replace(/^v/i, '')
    .split('-')[0]
    ?.split('.')
    .filter((part) => NUMERIC.test(part))
    .map(Number) ?? []

export const isNewerVersion = (candidate: string, current: string): boolean => {
  const left = parts(candidate)
  const right = parts(current)
  if (left.length === 0 || right.length === 0) return false
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? 0
    const b = right[index] ?? 0
    if (a !== b) return a > b
  }
  return false
}
