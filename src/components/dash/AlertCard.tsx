import { STRINGS } from '../../strings'
import { useCriticalAlerts } from '../../hooks/useCriticalAlert'
import { UiIcon } from '../icons/UiIcons'
import { AddAlertButton } from './AddAlertButton'
import { BuiltInAlertList } from './BuiltInAlertList'
import { ConfiguredAlertItem } from './ConfiguredAlertItem'

const D = STRINGS.dash

const ConfiguredAlerts = () => {
  const alerts = useCriticalAlerts()
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-bold">{D.yourAlerts}</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-app-secondary">{D.alertNone}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((alert, index) => (
            <ConfiguredAlertItem key={index} index={index} alert={alert} />
          ))}
        </ul>
      )}
      <AddAlertButton count={alerts.length} />
    </div>
  )
}

export const AlertCard = () => (
  <section
    aria-label={D.alert}
    className="flex flex-col overflow-hidden rounded-card border-2 border-app-primary bg-app-surface"
  >
    <div className="flex min-h-11 items-center gap-2.5 bg-app-primary px-3.5 text-white lg:min-h-12 lg:px-5">
      <UiIcon name="fullScreen" />
      <span className="text-base font-bold lg:text-[17px]">{D.alert}</span>
    </div>
    <div className="flex flex-col gap-4 px-3.5 pb-3 pt-2.5 lg:px-5 lg:pb-5 lg:pt-4">
      <p className="text-[13px] leading-snug text-app-secondary lg:text-sm lg:leading-5">
        {D.alertHint}
      </p>
      <ConfiguredAlerts />
      <div className="border-t border-app-divider" />
      <BuiltInAlertList />
    </div>
  </section>
)
