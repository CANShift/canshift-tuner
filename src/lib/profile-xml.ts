import { SignalDefSchema } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { formatByteRange, parseByteRange } from './signal-bytes'
import { slugForFileName } from './file-name'

export const PROFILE_XML_ROOT = 'canshift-profile'
export const PROFILE_XML_MIME = 'application/xml'
export const PROFILE_XML_ACCEPT = '.xml,application/xml,text/xml'

const SIGNAL_ELEMENT = /<signal\b([^>]*?)\/?>/g
const ATTRIBUTE = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g

const OPTIONAL_NUMBERS = {
  'warn-low': 'warningLevel',
  'danger-low': 'dangerLevel',
  'warn-high': 'highWarningLevel',
  'danger-high': 'highDangerLevel',
  'target-id': 'targetId',
} as const satisfies Record<string, keyof SignalDef>

const OPTIONAL_STRINGS = {
  'bit-mask': 'bitMask',
  expr: 'expr',
  type: 'type',
} as const satisfies Record<string, keyof SignalDef>

const EXPR_REFS = 'expr-refs'

export type ProfileXmlResult =
  | { kind: 'ok'; signals: SignalDef[] }
  | { kind: 'not-a-profile' }
  | { kind: 'empty' }
  | { kind: 'invalid'; message: string }

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const unescapeAttribute = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')

const optionalAttributes = (signal: SignalDef): string[] => {
  const numbers = Object.entries(OPTIONAL_NUMBERS)
    .filter(([, field]) => typeof signal[field] === 'number')
    .map(([attribute, field]) => `${attribute}="${String(signal[field])}"`)
  const strings = Object.entries(OPTIONAL_STRINGS)
    .filter(([, field]) => typeof signal[field] === 'string')
    .map(([attribute, field]) => `${attribute}="${escapeAttribute(String(signal[field]))}"`)
  const refs = signal.exprRefs
  const exprRefs = refs === undefined ? [] : [`${EXPR_REFS}="${refs.join(',')}"`]
  return [...numbers, ...strings, ...exprRefs]
}

const signalElement = (signal: SignalDef): string => {
  const attributes = [
    `name="${escapeAttribute(signal.name)}"`,
    `id="${escapeAttribute(signal.canFrameId)}"`,
    `bytes="${formatByteRange(signal.startByte, signal.byteLength)}"`,
    `unit="${escapeAttribute(signal.unit)}"`,
    `endian="${signal.bigEndian ? 'big' : 'little'}"`,
    `signed="${String(signal.signed)}"`,
    `scale="${String(signal.scale)}"`,
    `offset="${String(signal.offset)}"`,
    `min="${String(signal.min)}"`,
    `max="${String(signal.max)}"`,
    `timeout="${String(signal.timeoutMs)}"`,
    ...optionalAttributes(signal),
  ]
  return `    <signal ${attributes.join(' ')} />`
}

export const serializeProfileXml = (signals: readonly SignalDef[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<${PROFILE_XML_ROOT}>`,
    '  <signals>',
    ...signals.map(signalElement),
    '  </signals>',
    `</${PROFILE_XML_ROOT}>`,
    '',
  ].join('\n')

const attributesOf = (raw: string): Record<string, string> => {
  const found: Record<string, string> = {}
  for (const match of raw.matchAll(ATTRIBUTE)) {
    const [, key, value] = match
    if (key !== undefined && value !== undefined) found[key] = unescapeAttribute(value)
  }
  return found
}

const optionalFields = (attributes: Record<string, string>): Record<string, unknown> => {
  const fields: Record<string, unknown> = {}
  for (const [attribute, field] of Object.entries(OPTIONAL_NUMBERS)) {
    const raw = attributes[attribute]
    if (raw !== undefined && raw.length > 0) fields[field] = Number(raw)
  }
  for (const [attribute, field] of Object.entries(OPTIONAL_STRINGS)) {
    const raw = attributes[attribute]
    if (raw !== undefined && raw.length > 0) fields[field] = raw
  }
  const refs = attributes[EXPR_REFS]
  if (refs !== undefined && refs.length > 0) fields.exprRefs = refs.split(',').map(Number)
  return fields
}

const candidateFrom = (attributes: Record<string, string>): Record<string, unknown> => {
  const range = parseByteRange(attributes.bytes ?? '')
  return {
    name: attributes.name ?? '',
    canFrameId: attributes.id ?? '',
    startByte: range?.startByte ?? -1,
    byteLength: range?.byteLength ?? 0,
    bigEndian: attributes.endian === 'big',
    signed: attributes.signed === 'true',
    scale: Number(attributes.scale ?? '1'),
    offset: Number(attributes.offset ?? '0'),
    unit: attributes.unit ?? '',
    min: Number(attributes.min ?? '0'),
    max: Number(attributes.max ?? '100'),
    timeoutMs: Number(attributes.timeout ?? '1000'),
    ...optionalFields(attributes),
  }
}

export const parseProfileXml = (xml: string): ProfileXmlResult => {
  if (!xml.includes(`<${PROFILE_XML_ROOT}`)) return { kind: 'not-a-profile' }

  const elements = [...xml.matchAll(SIGNAL_ELEMENT)]
  if (elements.length === 0) return { kind: 'empty' }

  const signals: SignalDef[] = []
  for (const [index, element] of elements.entries()) {
    const attributes = attributesOf(element[1] ?? '')
    const parsed = SignalDefSchema.safeParse(candidateFrom(attributes))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const where = attributes.name ?? `signal ${String(index + 1)}`
      return {
        kind: 'invalid',
        message: `"${where}" is not valid — ${issue?.message ?? 'unknown'}`,
      }
    }
    signals.push(parsed.data)
  }
  return { kind: 'ok', signals }
}

const PROFILE_EXTENSION = /(\.canshift)?\.xml$/i

export const profileXmlFilename = (profileLabel: string): string =>
  `${slugForFileName(profileLabel, 'profile')}.canshift.xml`

export const profileLabelFromFileName = (fileName: string): string =>
  fileName.replace(PROFILE_EXTENSION, '')
