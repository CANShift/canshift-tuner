const PAGE_SIZE = 4096
const ENTRY_SIZE = 32
const ENTRIES_PER_PAGE = 126
const HEADER_SIZE = 32
const BITMAP_SIZE = 32
const KEY_FIELD_SIZE = 16
const MAX_KEY_LENGTH = KEY_FIELD_SIZE - 1

const PAGE_STATE_ACTIVE = 0xfffffffe
const PAGE_VERSION_V2 = 0xfe
const ERASED = 0xff

const TYPE_U8 = 0x01
const TYPE_STRING = 0x21
const CHUNK_INDEX_NONE = 0xff
const NAMESPACE_INDEX = 1

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let value = i
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1
    }
    table[i] = value >>> 0
  }
  return table
})()

const crc32 = (bytes: Uint8Array, previous = 0xffffffff): number => {
  let crc = ~previous >>> 0
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0)
  }
  return ~crc >>> 0
}

const writeKey = (entry: Uint8Array, key: string): void => {
  const encoded = new TextEncoder().encode(key)
  entry.set(encoded, 8)
}

const sealEntry = (entry: Uint8Array): Uint8Array => {
  const running = crc32(entry.subarray(0, 4))
  new DataView(entry.buffer, entry.byteOffset).setUint32(
    4,
    crc32(entry.subarray(8, ENTRY_SIZE), running),
    true
  )
  return entry
}

const namespaceEntry = (namespace: string): Uint8Array => {
  const entry = new Uint8Array(ENTRY_SIZE).fill(ERASED)
  entry[0] = 0
  entry[1] = TYPE_U8
  entry[2] = 1
  entry[3] = CHUNK_INDEX_NONE
  entry.fill(0, 8, 8 + KEY_FIELD_SIZE)
  writeKey(entry, namespace)
  entry[24] = NAMESPACE_INDEX
  return sealEntry(entry)
}

const stringEntry = (key: string, data: Uint8Array, span: number): Uint8Array => {
  const entry = new Uint8Array(ENTRY_SIZE).fill(ERASED)
  entry[0] = NAMESPACE_INDEX
  entry[1] = TYPE_STRING
  entry[2] = span
  entry[3] = CHUNK_INDEX_NONE
  entry.fill(0, 8, 8 + KEY_FIELD_SIZE)
  writeKey(entry, key)
  const view = new DataView(entry.buffer, entry.byteOffset)
  view.setUint16(24, data.length, true)
  view.setUint32(28, crc32(data), true)
  return sealEntry(entry)
}

const pageHeader = (): Uint8Array => {
  const header = new Uint8Array(HEADER_SIZE).fill(ERASED)
  const view = new DataView(header.buffer)
  view.setUint32(0, PAGE_STATE_ACTIVE, true)
  view.setUint32(4, 0, true)
  header[8] = PAGE_VERSION_V2
  view.setUint32(28, crc32(header.subarray(4, 28)), true)
  return header
}

const writtenBitmap = (writtenEntries: number): Uint8Array => {
  const bitmap = new Uint8Array(BITMAP_SIZE).fill(ERASED)
  for (let index = 0; index < writtenEntries; index += 1) {
    const byte = index >> 2
    const current = bitmap[byte] ?? ERASED
    bitmap[byte] = current & ~(1 << ((index & 3) * 2))
  }
  return bitmap
}

export const NVS_MIN_PARTITION_SIZE = PAGE_SIZE * 3

export const buildNvsImage = (
  namespace: string,
  key: string,
  value: string,
  partitionSize: number
): Uint8Array => {
  if (namespace.length === 0 || namespace.length > MAX_KEY_LENGTH) {
    throw new Error(`NVS namespace must be 1..${String(MAX_KEY_LENGTH)} characters`)
  }
  if (key.length === 0 || key.length > MAX_KEY_LENGTH) {
    throw new Error(`NVS key must be 1..${String(MAX_KEY_LENGTH)} characters`)
  }
  if (partitionSize < NVS_MIN_PARTITION_SIZE || partitionSize % PAGE_SIZE !== 0) {
    throw new Error(
      `NVS partition must be a whole number of ${String(PAGE_SIZE)}-byte pages, at least ${String(NVS_MIN_PARTITION_SIZE)}`
    )
  }

  const encoded = new TextEncoder().encode(value)
  const data = new Uint8Array(encoded.length + 1)
  data.set(encoded)

  const dataEntries = Math.ceil(data.length / ENTRY_SIZE)
  const span = dataEntries + 1
  const usedEntries = span + 1
  if (usedEntries > ENTRIES_PER_PAGE) {
    throw new Error(
      `value needs ${String(usedEntries)} NVS entries, page holds ${String(ENTRIES_PER_PAGE)}`
    )
  }

  const image = new Uint8Array(partitionSize).fill(ERASED)
  image.set(pageHeader(), 0)
  image.set(writtenBitmap(usedEntries), HEADER_SIZE)

  const entriesStart = HEADER_SIZE + BITMAP_SIZE
  image.set(namespaceEntry(namespace), entriesStart)
  image.set(stringEntry(key, data, span), entriesStart + ENTRY_SIZE)
  image.set(data, entriesStart + ENTRY_SIZE * 2)

  return image
}
