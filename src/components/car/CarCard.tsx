import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useCarLabel } from '../../hooks/useCarLabel'

export const CarCard = ({ onChange }: { onChange: () => void }) => (
  <section className="flex flex-wrap items-center gap-3 rounded-card border border-app-border bg-app-surface px-4 py-3.5 lg:px-5 lg:py-4">
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-[13px] text-app-muted">{STRINGS.car.ecu}</span>
      <span className="text-[17px] font-semibold lg:text-lg">{useCarLabel()}</span>
    </div>
    <Button variant="secondary" className="text-[15px]" onClick={onChange}>
      <span className="lg:hidden">{STRINGS.car.change}</span>
      <span className="max-lg:hidden">{STRINGS.car.changeCar}</span>
    </Button>
  </section>
)
