import { renderToStaticMarkup } from 'react-dom/server'
import type { PageButtonRole, PageButtons } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { PageButtonsPanel } from './PageButtonsCard'

const D = STRINGS.dash

const render = (buttons: PageButtons): string =>
  renderToStaticMarkup(
    <PageButtonsPanel
      editor={{ signalOf: (role: PageButtonRole) => buttons[role], set: () => undefined }}
    />
  )

describe('PageButtonsPanel', () => {
  it('shows both directions unset, with the tap-edge hint', () => {
    const html = render({})
    expect(html).toContain(D.nextPage)
    expect(html).toContain(D.previousPage)
    expect(html.split(D.noButton)).toHaveLength(3)
    expect(html).toContain(D.tapEdgesHint)
    expect(html).not.toContain(D.clearButton(D.nextPage))
  })

  it('names the bound signal and offers to clear only that direction', () => {
    const html = render({ next: 'flag_cruise' })
    expect(html).toContain(signalName('flag_cruise'))
    expect(html).toContain(D.clearButton(D.nextPage))
    expect(html).not.toContain(D.clearButton(D.previousPage))
  })
})
