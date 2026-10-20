import { describe, expect, it } from 'vitest'
import { boardLacksImu } from './board-imu'

describe('boardLacksImu', () => {
  it('flags a known board without an IMU', () => {
    expect(boardLacksImu('crowpanel_28')).toBe(true)
  })

  it('clears a board that declares one', () => {
    expect(boardLacksImu('waveshare_s3_28')).toBe(false)
  })

  it('does not block when no board is connected or the board is not in the catalog', () => {
    expect(boardLacksImu(null)).toBe(false)
    expect(boardLacksImu('custom_board')).toBe(false)
  })
})
