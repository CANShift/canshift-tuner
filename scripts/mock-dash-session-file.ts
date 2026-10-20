const MAGIC = 'CSLG'
const FORMAT_VERSION = 1
const RECORD_HEADER = 1
const RECORD_SAMPLE = 2
const RECORD_LAP = 3
const RECORD_END = 4
const CRC_SEED = 0xffff
const CRC_POLY = 0x1021
const CRC_TOP_BIT = 0x8000
const CRC_MASK = 0xffff
const BITS_PER_BYTE = 8
const SAMPLE_PERIOD_MS = 50

export interface MockSignal {
  id: number
  name: string
  at: (seconds: number) => number
}

export interface MockSessionShape {
  session: number
  seconds: number
  lapEveryS: number
  closed: boolean
}

const crc16 = (bytes: Buffer): number =>
  bytes.reduce((crc, byte) => {
    let acc = crc ^ (byte << BITS_PER_BYTE)
    for (let bit = 0; bit < BITS_PER_BYTE; bit++) {
      const shifted = (acc << 1) & CRC_MASK
      acc = (acc & CRC_TOP_BIT) === 0 ? shifted : shifted ^ CRC_POLY
    }
    return acc
  }, CRC_SEED)

const frame = (kind: number, payload: Buffer): Buffer => {
  const prefix = Buffer.alloc(3)
  prefix.writeUInt8(kind, 0)
  prefix.writeUInt16LE(payload.length, 1)
  const body = Buffer.concat([prefix, payload])
  const crc = Buffer.alloc(2)
  crc.writeUInt16LE(crc16(body), 0)
  return Buffer.concat([body, crc])
}

const header = (session: number, signals: readonly MockSignal[]): Buffer => {
  const fixed = Buffer.alloc(5)
  fixed.writeUInt16LE(SAMPLE_PERIOD_MS, 0)
  fixed.writeUInt16LE(session, 2)
  fixed.writeUInt8(signals.length, 4)
  const entries = signals.map(({ id, name }) =>
    Buffer.concat([Buffer.from([id, name.length]), Buffer.from(name, 'ascii')])
  )
  return frame(RECORD_HEADER, Buffer.concat([fixed, ...entries]))
}

const sample = (tMs: number, signals: readonly MockSignal[]): Buffer => {
  const fixed = Buffer.alloc(12)
  fixed.writeUInt32LE(tMs, 0)
  const mask = signals.reduce((bits, { id }) => bits | (1n << BigInt(id)), 0n)
  fixed.writeBigUInt64LE(mask, 4)
  const values = [...signals]
    .sort((a, b) => a.id - b.id)
    .map((signal) => {
      const value = Buffer.alloc(4)
      value.writeFloatLE(signal.at(tMs / 1_000), 0)
      return value
    })
  return frame(RECORD_SAMPLE, Buffer.concat([fixed, ...values]))
}

const lap = (tMs: number, index: number, lapMs: number): Buffer => {
  const payload = Buffer.alloc(10)
  payload.writeUInt32LE(tMs, 0)
  payload.writeUInt16LE(index, 4)
  payload.writeUInt32LE(lapMs, 6)
  return frame(RECORD_LAP, payload)
}

const end = (tMs: number): Buffer => {
  const payload = Buffer.alloc(8)
  payload.writeUInt32LE(tMs, 0)
  return frame(RECORD_END, payload)
}

const recordsAt = (tMs: number, shape: MockSessionShape, signals: readonly MockSignal[]) => {
  const lapMs = shape.lapEveryS * 1_000
  const lapEnds = tMs > 0 && tMs % lapMs === 0
  return lapEnds ? [sample(tMs, signals), lap(tMs, tMs / lapMs, lapMs)] : [sample(tMs, signals)]
}

export const mockSessionFile = (
  shape: MockSessionShape,
  signals: readonly MockSignal[]
): Buffer => {
  const totalMs = shape.seconds * 1_000
  const records: Buffer[] = []
  for (let tMs = 0; tMs <= totalMs; tMs += SAMPLE_PERIOD_MS) {
    records.push(...recordsAt(tMs, shape, signals))
  }
  const preamble = Buffer.concat([Buffer.from(MAGIC, 'ascii'), Buffer.from([FORMAT_VERSION])])
  const body = Buffer.concat([preamble, header(shape.session, signals), ...records])
  return shape.closed ? Buffer.concat([body, end(totalMs)]) : body.subarray(0, body.length - 3)
}
