import { FIRMWARE_CAPS } from '@canshift/core'
import type { DashboardConfig, SignalDef } from '@canshift/core'
import { STRINGS } from '../../strings'
import { describeLayoutOverflow } from '../layout-overflow'
import { unreadableWidgets } from '../../utils/unbound-widgets'
import { pageName, widgetName } from './describe'
import type { Refusal } from './refusal'

const R = STRINGS.refused

export interface PreflightInputs {
  config: DashboardConfig
  signals: readonly SignalDef[]
  firmwareMismatch: boolean
}

const firmwareReasons = ({ firmwareMismatch }: PreflightInputs): Refusal[] =>
  firmwareMismatch
    ? [{ where: STRINGS.changes.dashWhere, text: R.newerFirmware, target: null, section: 'dash' }]
    : []

const spaceReasons = ({ config }: PreflightInputs): Refusal[] =>
  config.pages.length > FIRMWARE_CAPS.MAX_PAGES
    ? [{ where: STRINGS.changes.gaugesWhere, text: R.outOfSpace, target: null, section: 'gauges' }]
    : []

const crowdedPages = ({ config }: PreflightInputs): Refusal[] =>
  config.pages
    .filter((page) => page.widgets.length > FIRMWARE_CAPS.MAX_WIDGETS_PER_PAGE)
    .map((page) => ({
      where: STRINGS.changes.pageWhere(pageName(page)),
      text: R.tooManyGauges(pageName(page)),
      target: { pageId: page.id },
      section: 'gauges',
    }))

const overflowReasons = ({ config }: PreflightInputs): Refusal[] => {
  const overflow = describeLayoutOverflow(config)
  if (overflow === null) return []
  const page = pageName({ id: overflow.pageId })
  return [
    {
      where: STRINGS.changes.pageWhere(page),
      text: R.tooManyGauges(page),
      target: { pageId: overflow.pageId, widgetId: overflow.widgetId },
      section: 'gauges',
    },
  ]
}

const signalReasons = ({ config, signals }: PreflightInputs): Refusal[] =>
  unreadableWidgets(config, signals).map(({ page, widget }) => ({
    where: STRINGS.changes.pageWhere(pageName(page)),
    text: R.unknownSignal(widgetName(widget), pageName(page)),
    target: { pageId: page.id, widgetId: widget.id },
    section: 'gauges',
  }))

const CHECKS: readonly ((inputs: PreflightInputs) => Refusal[])[] = [
  firmwareReasons,
  spaceReasons,
  crowdedPages,
  overflowReasons,
  signalReasons,
]

export const preflightRefusals = (inputs: PreflightInputs): Refusal[] =>
  CHECKS.flatMap((check) => check(inputs))
