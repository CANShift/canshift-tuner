import { STRINGS } from '../../strings'
import { AboutCard } from './AboutCard'
import { AlertCard } from './AlertCard'
import { BackupCard } from './BackupCard'
import { CanSpeedCard } from './CanSpeedCard'
import { DisplayCard } from './DisplayCard'
import { ScreenCard } from './ScreenCard'
import { ThemeCard } from './ThemeCard'

const DashSection = () => (
  <div className="flex flex-1 flex-col overflow-y-auto">
    <div className="flex w-full flex-col gap-3 p-4 lg:gap-5 lg:p-8">
      <h1 className="text-2xl font-bold lg:text-[28px]">{STRINGS.dash.title}</h1>
      <div className="grid gap-3 lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="lg:col-start-1 lg:row-start-1">
          <DisplayCard />
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <AlertCard />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <CanSpeedCard />
        </div>
        <div className="lg:col-start-1 lg:row-start-3">
          <BackupCard />
        </div>
        <div className="lg:col-start-2 lg:row-start-3">
          <AboutCard />
        </div>
      </div>
      <h2 className="text-lg font-bold">{STRINGS.dash.more}</h2>
      <div className="grid gap-3 lg:grid-cols-2 lg:items-start lg:gap-5">
        <ScreenCard />
        <ThemeCard />
      </div>
    </div>
  </div>
)

export default DashSection
