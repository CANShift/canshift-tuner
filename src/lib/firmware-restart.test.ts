import { describe, expect, it, vi } from 'vitest'
import { INSTALLED_MESSAGES, releaseLinkAfterInstall } from './firmware-restart'

describe('releaseLinkAfterInstall', () => {
  it('drops a Wi-Fi link with the restart notice, since the dash restarts outside workshop mode', () => {
    const disconnect = vi.fn()
    releaseLinkAfterInstall('wifi', disconnect)
    expect(disconnect).toHaveBeenCalledExactlyOnceWith(INSTALLED_MESSAGES.wifi)
  })

  it('keeps a USB link so it reconnects after the restart', () => {
    const disconnect = vi.fn()
    releaseLinkAfterInstall('usb', disconnect)
    expect(disconnect).not.toHaveBeenCalled()
  })

  it('tells a Wi-Fi user to re-enter workshop mode', () => {
    expect(INSTALLED_MESSAGES.wifi).toMatch(/enter workshop mode again/)
    expect(INSTALLED_MESSAGES.usb).toMatch(/reconnects on its own/)
  })
})
