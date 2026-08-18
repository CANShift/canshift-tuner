export const slugForFileName = (name: string, fallback: string): string =>
  name
    .trim()
    .replace(/[^a-z0-9\-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || fallback
