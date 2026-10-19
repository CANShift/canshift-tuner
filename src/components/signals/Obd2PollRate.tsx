import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STRINGS } from '../../strings'

const C = STRINGS.car

export interface Obd2PollRateProps {
  intervalMs: number
  intervals: readonly number[]
  onInterval: (ms: number) => void
}

export const Obd2PollRate = ({ intervalMs, intervals, onInterval }: Obd2PollRateProps) => (
  <label className="flex items-center justify-between gap-4 text-[15px]">
    {C.pollRate}
    <Select
      value={String(intervalMs)}
      onValueChange={(value) => {
        onInterval(Number(value))
      }}
    >
      <SelectTrigger aria-label={C.pollRate} className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {intervals.map((ms) => (
          <SelectItem key={ms} value={String(ms)}>
            {C.pollEvery(ms)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </label>
)
