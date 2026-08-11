const RX_BUFFER_MAX_CHARS = 64 * 1024

export class LineFramer {
  private buffer = ''
  private resyncing = false
  private readonly decoder = new TextDecoder()

  push(chunk: Uint8Array): string[] {
    this.buffer += this.decoder.decode(chunk, { stream: true })
    return this.drain()
  }

  finish(): string[] {
    const tail = this.decoder.decode()
    if (tail) this.buffer += tail
    return this.drain()
  }

  reset(): void {
    this.buffer = ''
    this.resyncing = false
  }

  private drain(): string[] {
    const lines = this.takeCompleteLines()
    if (this.buffer.length > RX_BUFFER_MAX_CHARS) this.beginResync()
    return lines
  }

  private takeCompleteLines(): string[] {
    const lines: string[] = []
    let nl = this.buffer.indexOf('\n')
    while (nl !== -1) {
      lines.push(this.buffer.slice(0, nl).replace(/\r$/, ''))
      this.buffer = this.buffer.slice(nl + 1)
      nl = this.buffer.indexOf('\n')
    }
    return this.dropResyncRemnant(lines).filter((line) => line.length > 0)
  }

  private dropResyncRemnant(lines: string[]): string[] {
    if (!this.resyncing || lines.length === 0) return lines
    this.resyncing = false
    return lines.slice(1)
  }

  private beginResync(): void {
    const alreadyResyncing = this.resyncing
    this.buffer = ''
    this.resyncing = true
    if (alreadyResyncing) return
    console.warn(
      `[serial] rx buffer passed ${String(RX_BUFFER_MAX_CHARS)} chars with no frame terminator — discarding until the next newline`
    )
  }
}
