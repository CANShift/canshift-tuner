import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'

const F = STRINGS.firstOpen

const CHOOSE_CAR_PATH = '/car?choose=1'

const STEPS = [F.stepSignals, F.stepGauges]

const StepNumber = ({ n, current }: { n: number; current: boolean }) => (
  <span
    className={cn(
      'grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold',
      current ? 'bg-app-accent text-app-bg' : 'border-[1.5px] border-[#3a3f46] text-app-muted'
    )}
  >
    {n}
  </span>
)

const Steps = () => (
  <ol className="flex flex-col gap-3">
    <li className="flex items-center gap-3">
      <StepNumber n={1} current />
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold">{F.stepCar}</span>
        <span className="text-[13px] text-app-warning">{F.notChosen}</span>
      </span>
    </li>
    {STEPS.map((step, index) => (
      <li key={step} className="flex items-center gap-3">
        <StepNumber n={index + 2} current={false} />
        <span className="text-[15px] text-app-secondary">{step}</span>
      </li>
    ))}
  </ol>
)

export const SetupCard = () => {
  const navigate = useNavigate()
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-app-border bg-app-surface p-4 lg:p-6">
      <h2 className="text-[17px] font-semibold lg:text-lg">{F.setupTitle}</h2>
      <Steps />
      <Button className="h-12 text-base" onClick={() => void navigate(CHOOSE_CAR_PATH)}>
        {F.button}
      </Button>
      <p className="text-[13px] leading-snug text-app-muted">{F.hint}</p>
    </section>
  )
}

export const FirstOpenHeading = () => (
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-bold leading-8 lg:text-[28px] lg:leading-9">{F.title}</h1>
    <p className="text-[15px] leading-6 text-app-muted lg:text-base">{F.sub}</p>
  </div>
)
