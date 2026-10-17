import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { AdjustReadingSheet } from './AdjustReadingSheet'
import { CarHeader } from './CarHeader'
import { ChooseCarSheet } from './ChooseCarSheet'
import { RawFramesLink } from './RawFramesLink'
import { SignalsCard } from './SignalsCard'
import { LivePlotCard } from './LivePlotCard'
import { ObdCard } from './ObdCard'
import { Disclosure } from '../chrome/Disclosure'
import { useIsLaptop } from '../../hooks/useIsLaptop'

const CarMore = () => (
  <div className="flex flex-col gap-4 lg:gap-5">
    <h2 className="text-lg font-bold lg:sr-only min-[1600px]:not-sr-only">{STRINGS.car.more}</h2>
    <Disclosure title={STRINGS.car.obd} hint={STRINGS.car.obdHint}>
      <ObdCard />
    </Disclosure>
    <RawFramesLink />
  </div>
)

const CAR_GRID = [
  'flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)] lg:items-start lg:gap-5',
  'lg:grid-cols-[auto_minmax(0,1fr)] min-[1600px]:grid-cols-[auto_minmax(0,1fr)_minmax(280px,360px)]',
].join(' ')

const LivePlot = () => (
  <Disclosure
    title={STRINGS.car.livePlot}
    hint={STRINGS.car.livePlotHint}
    defaultOpen={useIsLaptop()}
    className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col min-[1600px]:sticky min-[1600px]:top-0"
    bodyClassName="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
  >
    <LivePlotCard />
  </Disclosure>
)

const CHOOSE_PARAM = 'choose'

const CarSection = () => {
  const [params] = useSearchParams()
  const [choosing, setChoosing] = useState(params.get(CHOOSE_PARAM) !== null)
  const [adjusting, setAdjusting] = useState<string | null>(null)
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex w-full flex-col gap-4 p-4 lg:min-h-0 lg:flex-1 lg:gap-5 lg:p-8">
        <CarHeader onChange={() => setChoosing(true)} />
        <div className={CAR_GRID}>
          <div className="flex min-w-0 flex-col gap-4">
            <SignalsCard onAdjust={setAdjusting} />
          </div>
          <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:self-stretch lg:gap-5 min-[1600px]:contents">
            <LivePlot />
            <CarMore />
          </div>
        </div>
      </div>
      <ChooseCarSheet open={choosing} onOpenChange={setChoosing} />
      <AdjustReadingSheet signalName={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  )
}

export default CarSection
