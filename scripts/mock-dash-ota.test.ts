import { createHash, generateKeyPairSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { CMD_OTA_BEGIN, CMD_OTA_END, CMD_OTA_WRITE } from '../src/transport/opcodes'
import { otaBegin, otaEnd, otaWrite } from './mock-dash-ota'
import { signImage } from './mock-dash-signing'
import { freshState } from './mock-dash-state'

const IMAGE_BYTES = 1024
const ESP_IMAGE_MAGIC = 0xe9
const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20
const APP_VERSION_OFFSET = APP_DESC_OFFSET + 16
const NEW_VERSION = '9.9.9'

const appImage = (): Buffer => {
  const image = Buffer.alloc(IMAGE_BYTES)
  image[0] = ESP_IMAGE_MAGIC
  image.writeUInt32LE(APP_DESC_MAGIC, APP_DESC_OFFSET)
  image.write(NEW_VERSION, APP_VERSION_OFFSET, 'utf8')
  return image
}

const dashKey = generateKeyPairSync('ed25519')
const strangerKey = generateKeyPairSync('ed25519')
const IMAGE = appImage()

const beginCommand = (sig?: Buffer) => ({
  cmd: CMD_OTA_BEGIN,
  total: IMAGE.length,
  sha256: createHash('sha256').update(IMAGE).digest('hex'),
  version: NEW_VERSION,
  ...(sig === undefined ? {} : { sig: sig.toString('base64') }),
})

const install = (sig?: Buffer) => {
  const state = freshState(dashKey.publicKey)
  const begin = otaBegin(beginCommand(sig), state)
  if (begin.reply.status !== 'ok') return { state, reply: begin.reply }
  otaWrite({ cmd: CMD_OTA_WRITE, offset: 0, data: IMAGE.toString('base64') }, state)
  return { state, reply: otaEnd({ cmd: CMD_OTA_END, action: 'commit' }, state).reply }
}

describe('mock dash OTA signature', () => {
  it('installs an image signed by the dash key', () => {
    const { state, reply } = install(signImage(IMAGE, dashKey.privateKey))
    expect(reply).toEqual({ status: 'ok', restart: true })
    expect(state.firmwareVersion).toBe(NEW_VERSION)
  })

  it('refuses a missing signature at begin', () => {
    const { state, reply } = install()
    expect(reply).toEqual({ status: 'error', message: 'ota_unsigned' })
    expect(state.ota).toBeNull()
  })

  it('refuses a signature that is not 64 bytes at begin', () => {
    const { state, reply } = install(Buffer.alloc(32))
    expect(reply).toEqual({ status: 'error', message: 'ota_bad_signature' })
    expect(state.ota).toBeNull()
  })

  it('refuses at commit an image signed by another key', () => {
    const { state, reply } = install(signImage(IMAGE, strangerKey.privateKey))
    expect(reply).toEqual({ status: 'error', message: 'ota_bad_signature' })
    expect(state.firmwareVersion).not.toBe(NEW_VERSION)
  })
})
