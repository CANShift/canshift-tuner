export const plural = (n: number, one: string, many: string): string =>
  `${String(n)} ${n === 1 ? one : many}`
