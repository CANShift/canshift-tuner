import type { DashboardConfig } from '@canshift/core'

import { CMD_PUT_CONFIG_CHUNK } from './opcodes'
import { sendChunked } from './chunked-transfer'
import type { BurnPushResult } from './types'

export const burnConfigChunked = (config: DashboardConfig): Promise<BurnPushResult> => {
  const payload = new TextEncoder().encode(JSON.stringify(config))
  return sendChunked({
    cmd: CMD_PUT_CONFIG_CHUNK,
    payload,
    fieldsFor: (idx) => (idx === 0 ? { bytes: payload.length } : {}),
  })
}
