import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import { SoundPanel } from './SoundCard'

const D = STRINGS.dash

const render = (volume: number, boot: boolean, shiftTone: boolean): string =>
  renderToStaticMarkup(
    <SoundPanel sound={{ value: { volume, boot, shiftTone }, set: () => undefined }} />
  )

const checked = (html: string): number => html.split('aria-checked="true"').length - 1

describe('SoundPanel', () => {
  it('shows the volume and both switches with the critical-alert promise', () => {
    const html = render(70, true, false)
    expect(html).toContain(D.sound)
    expect(html).toContain(D.criticalSoundHint)
    expect(html).toContain('70%')
    expect(html).toContain(`aria-label="${D.bootSound}"`)
    expect(html).toContain(`aria-label="${D.shiftTone}"`)
    expect(checked(html)).toBe(1)
  })

  it('reflects both switches on at a low volume', () => {
    const html = render(5, true, true)
    expect(html).toContain('5%')
    expect(checked(html)).toBe(2)
  })
})
