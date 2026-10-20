import { boardLacksImu } from '../lib/board-imu'
import { useDeviceStore } from '../stores/device.store'

export const useBoardLacksImu = (): boolean => useDeviceStore((s) => boardLacksImu(s.boardId))
