import type { ReactNode } from 'react'
import { STRINGS } from '../../strings'
import { useIsLaptop } from '../../hooks/useIsLaptop'
import { AboutCard } from './AboutCard'
import { AlertCard } from './AlertCard'
import { BackupCard } from './BackupCard'
import { CanSpeedCard } from './CanSpeedCard'
import { DisplayCard } from './DisplayCard'
import { PageButtonsCard } from './PageButtonsCard'
import { ScreenCard } from './ScreenCard'
import { SoundCard } from './SoundCard'
import { ThemeCard } from './ThemeCard'

const CardColumn = ({ children }: { children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-3 lg:gap-5">{children}</div>
)

const TwoColumns = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
    {children}
  </div>
)

const PhoneCards = () => (
  <CardColumn>
    <DisplayCard />
    <SoundCard />
    <AlertCard />
    <CanSpeedCard />
    <PageButtonsCard />
    <AboutCard />
    <BackupCard />
  </CardColumn>
)

const LaptopCards = () => (
  <TwoColumns>
    <CardColumn>
      <DisplayCard />
      <SoundCard />
      <CanSpeedCard />
      <PageButtonsCard />
      <BackupCard />
    </CardColumn>
    <CardColumn>
      <AlertCard />
      <AboutCard />
    </CardColumn>
  </TwoColumns>
)

const PrimaryCards = () => (useIsLaptop() ? <LaptopCards /> : <PhoneCards />)

const DashSection = () => (
  <div className="flex flex-1 flex-col overflow-y-auto">
    <div className="flex w-full flex-col gap-3 p-4 lg:gap-5 lg:p-8">
      <h1 className="text-2xl font-bold lg:text-[28px]">{STRINGS.dash.title}</h1>
      <PrimaryCards />
      <h2 className="text-lg font-bold">{STRINGS.dash.more}</h2>
      <TwoColumns>
        <CardColumn>
          <ScreenCard />
        </CardColumn>
        <CardColumn>
          <ThemeCard />
        </CardColumn>
      </TwoColumns>
    </div>
  </div>
)

export default DashSection
