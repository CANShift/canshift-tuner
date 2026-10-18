import { describe, expect, it, vi } from 'vitest'
import { AckQueue } from '../ack-queue'

const queue = () => {
  const written: string[] = []
  const acks = new AckQueue({
    canSend: () => true,
    write: (payload) => {
      written.push(payload)
      return Promise.resolve()
    },
  })
  return { acks, written }
}

const sentSeq = (line: string | undefined): number =>
  (JSON.parse(line ?? '{}') as { seq: number }).seq

describe('AckQueue — request id', () => {
  it('numbers every command right after its cmd', async () => {
    const { acks, written } = queue()
    const first = acks.send(0x11)
    acks.routeAck({ status: 'ok', seq: 1 })
    await first
    void acks.send(0x10, { day: true })
    expect(written).toEqual(['{"cmd":17,"seq":1}\n', '{"cmd":16,"seq":2,"day":true}\n'])
  })

  it('resolves on the reply that carries its seq', async () => {
    const { acks, written } = queue()
    const result = acks.send(0x11)
    expect(acks.routeAck({ status: 'ok', seq: sentSeq(written[0]) })).toBe(true)
    await expect(result).resolves.toMatchObject({ ok: true })
  })
})

describe('AckQueue — replies for another command', () => {
  it('drops a reply that answers another command and keeps waiting', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { acks, written } = queue()
    const result = acks.send(0x11)
    const seq = sentSeq(written[0])
    expect(acks.routeAck({ status: 'error', message: 'late', seq: seq + 7 })).toBe(true)
    acks.routeAck({ status: 'ok', seq })
    await expect(result).resolves.toMatchObject({ ok: true })
    warn.mockRestore()
  })

  it('still takes an untagged reply from a firmware without the echo', async () => {
    const { acks } = queue()
    const result = acks.send(0x11)
    acks.routeAck({ status: 'ok' })
    await expect(result).resolves.toMatchObject({ ok: true })
  })
})
