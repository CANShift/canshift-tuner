import { renderToStaticMarkup } from 'react-dom/server'
import { DEFAULT_PAGE_PALETTE, HexColorSchema } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { CruiseControlPreview } from './CruiseControlPreview'

const LOUD_PALETTE = {
  ...DEFAULT_PAGE_PALETTE,
  primary: HexColorSchema.parse('#00FF00'),
  text: HexColorSchema.parse('#0000FF'),
}

const render = (): string =>
  renderToStaticMarkup(
    <CruiseControlPreview scale={2} canvasW={640} contentH={440} palette={LOUD_PALETTE} />
  )

describe('CruiseControlPreview L-buttons', () => {
  it('draws the fixed dash outline whatever the page palette', () => {
    const html = render()
    expect(html.match(/stroke="#E03030"/g)).toHaveLength(4)
    expect(html).not.toContain('stroke="#00FF00"')
  })

  it('draws the labels in the fixed dash text colour', () => {
    expect(render().match(/fill="#FFFFFF"/g)).toHaveLength(4)
  })

  it('draws the buttons opaque', () => {
    expect(render()).not.toContain('opacity')
  })
})
