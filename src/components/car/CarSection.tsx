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
    <h2 className="text-lg font-bold xl:sr-only">{STRINGS.car.more}</h2>
    <Disclosure title={STRINGS.car.obd} hint={STRINGS.car.obdHint}>
      <ObdCard />
    </Disclosure>
    <RawFramesLink />
  </div>
)

const CAR_GRID =
  'flex flex-col gap-4 lg:gap-5 xl:grid xl:min-h-0 xl:flex-1 xl:grid-cols-[auto_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)]'

const LivePlot = () => (
  <Disclosure
    title={STRINGS.car.livePlot}
    hint={STRINGS.car.livePlotHint}
    defaultOpen={useIsLaptop()}
    className="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
    bodyClassName="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
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
      <div className="flex w-full flex-col gap-4 p-4 lg:gap-5 lg:p-8 xl:min-h-0 xl:flex-1">
        <CarHeader onChange={() => setChoosing(true)} />
        <div className={CAR_GRID}>
          <div className="flex min-w-0 flex-col gap-4 xl:min-h-0">
            <SignalsCard onAdjust={setAdjusting} />
          </div>
          <div className="flex min-w-0 flex-col gap-4 lg:gap-5 xl:min-h-0 xl:overflow-y-auto">
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
