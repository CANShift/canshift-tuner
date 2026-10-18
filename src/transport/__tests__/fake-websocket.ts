import { WebSocketClient } from '../websocket-client'

const URL = 'ws://192.168.4.1/ws'

export class FakeSocket {
  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: ((event?: CloseEvent) => void) | null = null

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
    this.onclose?.()
  }

  accept(): void {
    this.readyState = 1
    this.onopen?.()
  }

  receive(data: string): void {
    this.onmessage?.({ data } as MessageEvent)
  }

  drop(): void {
    this.readyState = 3
    this.onclose?.()
  }

  refuseBusy(): void {
    this.readyState = 3
    this.onclose?.({ code: 4001, reason: 'busy' } as CloseEvent)
  }
}

export const harness = () => {
  const sockets: FakeSocket[] = []
  const client = new WebSocketClient(URL, () => {
    const socket = new FakeSocket()
    sockets.push(socket)
    return socket as unknown as WebSocket
  })
  const latest = (): FakeSocket => {
    const socket = sockets[sockets.length - 1]
    if (socket === undefined) throw new Error('no socket opened')
    return socket
  }
  return { client, sockets, latest }
}

export const connected = async () => {
  const h = harness()
  const pending = h.client.connect()
  h.latest().accept()
  await pending
  return h
}
