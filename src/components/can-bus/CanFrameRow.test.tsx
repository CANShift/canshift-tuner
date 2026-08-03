import { describe, expect, it } from 'vitest'
import { CanFrameRow } from './CanFrameRow'
import { CanHistogramRow } from './CanHistogramRow'

const reactMemo = Symbol.for('react.memo')

describe('can-bus rows stay memoized', () => {
  it('CanFrameRow is wrapped in memo so unchanged rows skip the 4x/sec re-render', () => {
    expect((CanFrameRow as { $$typeof?: symbol }).$$typeof).toBe(reactMemo)
  })

  it('CanHistogramRow is wrapped in memo so an expanded histogram does not re-render on every tick', () => {
    expect((CanHistogramRow as { $$typeof?: symbol }).$$typeof).toBe(reactMemo)
  })
})
