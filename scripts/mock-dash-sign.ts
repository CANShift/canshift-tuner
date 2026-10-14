import { createPrivateKey } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { errorMessage } from '../src/lib/error-message'
import { MOCK_SIGNING_KEY_PATH, signImage } from './mock-dash-signing'

const signFile = (imagePath: string): string => {
  const privateKey = createPrivateKey(readFileSync(MOCK_SIGNING_KEY_PATH))
  const signaturePath = `${imagePath}.sig`
  writeFileSync(signaturePath, signImage(readFileSync(imagePath), privateKey))
  return signaturePath
}

const run = (imagePath: string | undefined): number => {
  if (imagePath === undefined) {
    console.error('[mock-dash:sign] usage: npm run mock-dash:sign -- <firmware.bin>')
    return 1
  }
  try {
    console.log(`[mock-dash:sign] wrote ${signFile(imagePath)}`)
    return 0
  } catch (err) {
    console.error(`[mock-dash:sign] ${errorMessage(err)}`)
    console.error('[mock-dash:sign] the mock writes its key on start: npm run mock-dash')
    return 1
  }
}

process.exitCode = run(process.argv[2])
