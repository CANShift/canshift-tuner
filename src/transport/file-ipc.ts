import { CMD_PUT_FILE } from './opcodes'
import { sendChunked } from './chunked-transfer'
import type { BurnPushResult } from './types'

export const SIGNALS_FILE_PATH = '/config/signals.json'

export const putFile = (path: string, text: string): Promise<BurnPushResult> =>
  sendChunked({
    cmd: CMD_PUT_FILE,
    payload: new TextEncoder().encode(text),
    fieldsFor: () => ({ path }),
  })
