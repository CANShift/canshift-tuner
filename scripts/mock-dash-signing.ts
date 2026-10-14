import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const OWNER_ONLY = 0o600

export const MOCK_SIGNING_KEY_PATH = join(tmpdir(), 'canshift-mock-dash-signing.pem')

export const startSigningKey = (): KeyObject => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  writeFileSync(MOCK_SIGNING_KEY_PATH, pem, { mode: OWNER_ONLY })
  return publicKey
}

export const signImage = (image: Buffer, privateKey: KeyObject): Buffer =>
  sign(null, image, privateKey)
