export const prettyProfileKey = (key: string): string => {
  const [, rest = key] = key.split(':')
  return rest.replace(/[-_]/g, ' ')
}
