export type ChangeTag = 'ADD' | 'FIX' | 'CHG'

export interface ChangelogEntry {
  tag: ChangeTag
  text: string
}

const MAX_ENTRIES = 12
const MAX_TEXT_LENGTH = 160

const BULLET = /^\s*[-*]\s+(.*)$/
const HEADING = /^\s*#{2,3}\s+(.*)$/
const CONVENTIONAL = /^([a-z]+)(\([^)]*\))?!?:\s*(.*)$/i

const TAG_BY_TYPE: Record<string, ChangeTag> = {
  feat: 'ADD',
  add: 'ADD',
  fix: 'FIX',
  perf: 'CHG',
  refactor: 'CHG',
  chore: 'CHG',
  docs: 'CHG',
}

const HEADING_TAGS: readonly { pattern: RegExp; tag: ChangeTag }[] = [
  { pattern: /\bfix|bug\b/i, tag: 'FIX' },
  { pattern: /\bnew\b|\badded\b/i, tag: 'ADD' },
]

const stripMarkdown = (line: string): string =>
  line
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    .trim()

const truncate = (text: string): string =>
  text.length <= MAX_TEXT_LENGTH ? text : `${text.slice(0, MAX_TEXT_LENGTH - 1).trimEnd()}…`

const firstSentence = (text: string): string => {
  const stop = text.search(/[.!?](\s|$)/)
  return stop === -1 ? text : text.slice(0, stop + 1)
}

const tagForHeading = (heading: string): ChangeTag =>
  HEADING_TAGS.find((candidate) => candidate.pattern.test(heading))?.tag ?? 'CHG'

const bulletEntry = (raw: string): ChangelogEntry => {
  const text = stripMarkdown(raw)
  const match = CONVENTIONAL.exec(text)
  if (!match) return { tag: 'CHG', text: truncate(text) }
  const tag = TAG_BY_TYPE[(match[1] ?? '').toLowerCase()] ?? 'CHG'
  return { tag, text: truncate(match[3] ?? text) }
}

const bulletEntries = (lines: readonly string[]): ChangelogEntry[] =>
  lines
    .map((line) => BULLET.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => bulletEntry(match[1] ?? ''))
    .filter((entry) => entry.text.length > 0)

const sectionEntries = (lines: readonly string[]): ChangelogEntry[] => {
  const entries: ChangelogEntry[] = []
  lines.forEach((line, index) => {
    const heading = HEADING.exec(line)
    if (!heading) return
    const title = stripMarkdown(heading[1] ?? '')
    const body = lines.slice(index + 1).find((candidate) => stripMarkdown(candidate).length > 0)
    const summary = body === undefined ? '' : firstSentence(stripMarkdown(body))
    const text = summary.length > 0 ? `${title} — ${summary}` : title
    if (title.length > 0) entries.push({ tag: tagForHeading(title), text: truncate(text) })
  })
  return entries
}

const LINE_BREAK = /\r?\n/

export const parseChangelog = (notes: string): ChangelogEntry[] => {
  const lines = notes.split(LINE_BREAK)
  const bullets = bulletEntries(lines)
  const entries = bullets.length > 0 ? bullets : sectionEntries(lines)
  return entries.slice(0, MAX_ENTRIES)
}
