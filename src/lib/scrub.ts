const HEX_PAYLOAD = /\b(?:[0-9A-Fa-f]{2}[\s:]){3,}[0-9A-Fa-f]{2}\b/g
const FRAME_ID = /\b0[xX][0-9A-Fa-f]{1,8}\b/g
const QUOTED_NAME = /"[^"]{1,120}"|'[^']{1,120}'|“[^”]{1,120}”/g

export const scrubText = (text: string): string =>
  text
    .replace(HEX_PAYLOAD, '[payload]')
    .replace(FRAME_ID, '[frame-id]')
    .replace(QUOTED_NAME, '[name]')

export const scrubProps = (props: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      typeof value === 'string' ? scrubText(value) : value,
    ])
  )
