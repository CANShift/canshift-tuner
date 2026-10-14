import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ConnectPanel, type ConnectPanelProps } from './ConnectPanel'

const render = (overrides: Partial<ConnectPanelProps> = {}): string =>
  renderToStaticMarkup(
    <ConnectPanel
      busy={false}
      connectLabel="Connect"
      error={null}
      onConnect={() => undefined}
      onEditOffline={() => undefined}
      {...overrides}
    />
  )

describe('ConnectPanel', () => {
  it('offers connecting and editing offline', () => {
    const html = render()
    expect(html).toContain('>Connect<')
    expect(html).toContain('>Edit offline<')
    expect(html).not.toContain('role="alert"')
  })

  it('disables connect while the port is opening', () => {
    const html = render({ busy: true, connectLabel: 'Connecting…' })
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Connecting…</)
  })

  it('shows the humanised connection error', () => {
    expect(render({ error: 'The port is busy.' })).toContain('The port is busy.')
  })
})
