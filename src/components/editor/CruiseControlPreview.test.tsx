import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CruiseControlPreview } from './CruiseControlPreview'

const SCALE = 2

const render = (): string =>
  renderToStaticMarkup(<CruiseControlPreview scale={SCALE} canvasW={640} contentH={440} />)

describe('CruiseControlPreview', () => {
  it('draws the L-buttons with the fixed dash outline', () => {
    expect(render().match(/stroke="#E03030"/g)).toHaveLength(4)
  })

  it('draws the L-button labels in the fixed dash text colour', () => {
    expect(render().match(/fill="#FFFFFF"/g)).toHaveLength(4)
  })

  it('draws the L-buttons opaque', () => {
    expect(render()).not.toContain('opacity')
  })

  it('draws the set-speed value with the 22 px face the dash snaps value(24) to', () => {
    expect(render()).toContain(`color:#FFFFFF;font-size:${String(22 * SCALE)}px`)
  })

  it('draws the centre captions in the dash dim colour', () => {
    expect(render().match(/text-\[#888888\]/g)).toHaveLength(2)
  })
})
