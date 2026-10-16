import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { AdjustReadingSheet } from './AdjustReadingSheet'
import { CarCard } from './CarCard'
import { ChooseCarSheet } from './ChooseCarSheet'
import { RawFramesLink } from './RawFramesLink'
import { SignalsCard } from './SignalsCard'
import { LivePlotCard } from './LivePlotCard'
import { ObdCard } from './ObdCard'
import { XmlCard } from './XmlCard'
import { Disclosure } from '../chrome/Disclosure'

const CarMore = () => (
  <>
    <h2 className="text-lg font-bold">{STRINGS.car.more}</h2>
    <Disclosure title={STRINGS.car.obd} hint={STRINGS.car.obdHint}>
      <ObdCard />
    </Disclosure>
    <Disclosure title={STRINGS.car.xml} hint={STRINGS.car.xmlHint}>
      <XmlCard />
    </Disclosure>
    <RawFramesLink />
  </>
)

const CHOOSE_PARAM = 'choose'

const CarSection = () => {
  const [params] = useSearchParams()
  const [choosing, setChoosing] = useState(params.get(CHOOSE_PARAM) !== null)
  const [adjusting, setAdjusting] = useState<string | null>(null)
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex w-full max-w-[1400px] flex-col gap-4 p-4 lg:gap-5 lg:p-8">
        <h1 className="text-2xl font-bold lg:text-[28px]">{STRINGS.car.yourCar}</h1>
        <CarCard onChange={() => setChoosing(true)} />
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-5">
          <div className="flex min-w-0 flex-col gap-4">
            <SignalsCard onAdjust={setAdjusting} />
          </div>
          <Disclosure title={STRINGS.car.livePlot} hint={STRINGS.car.livePlotHint}>
            <LivePlotCard />
          </Disclosure>
        </div>
        <CarMore />
      </div>
      <ChooseCarSheet open={choosing} onOpenChange={setChoosing} />
      <AdjustReadingSheet signalName={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  )
}

export default CarSection
