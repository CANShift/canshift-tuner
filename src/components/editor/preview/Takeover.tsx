import { CS_DANGER, CS_ENGAGED } from './preview-modes'

const SPLASH_NAME_PX = 6
const SPLASH_STATE_PX = 64
const SPLASH_DETAIL_PX = 10
const ALERT_NAME_PX = 13
const ALERT_VALUE_PX = 66
const ALERT_RULE_PX = 10
const ALERT_FOOTER_PX = 11
const RULE_PX = 1

export interface SplashTakeoverProps {
  scale: number
  bgColor: string
  dimColor: string
  trackColor: string
  name: string
  state: string
  detail: string
}

const SplashHeader = ({ scale, name }: { scale: number; name: string }) => (
  <div
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      borderTop: `${String(RULE_PX * scale)}px solid ${CS_ENGAGED}`,
      paddingTop: 4 * scale,
    }}
  >
    <div
      className="font-sans font-extrabold uppercase"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: SPLASH_NAME_PX * scale, letterSpacing: '0.2em', color: CS_ENGAGED }}
    >
      {name}
    </div>
  </div>
)

const SplashState = ({ scale, state }: { scale: number; state: string }) => (
  <div
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      fontSize: SPLASH_STATE_PX * scale,
      lineHeight: 0.9,
      letterSpacing: '-0.045em',
      color: CS_ENGAGED,
      marginTop: 11 * scale,
    }}
  >
    {state}
  </div>
)

type SplashDetailProps = Pick<SplashTakeoverProps, 'scale' | 'trackColor' | 'dimColor' | 'detail'>

const SplashDetail = ({ scale, trackColor, dimColor, detail }: SplashDetailProps) => (
  <div
    className="mt-auto"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      borderTop: `${String(scale)}px solid ${trackColor}`,
      paddingTop: 7 * scale,
      fontSize: SPLASH_DETAIL_PX * scale,
      color: dimColor,
    }}
  >
    {detail}
  </div>
)

export const SplashTakeover = ({ scale, bgColor, name, state, ...detail }: SplashTakeoverProps) => (
  <div
    className="absolute inset-0 z-3 flex flex-col"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ background: bgColor, padding: 4 * scale }}
  >
    <SplashHeader scale={scale} name={name} />
    <SplashState scale={scale} state={state} />
    <SplashDetail scale={scale} {...detail} />
  </div>
)

export interface AlertTakeoverProps {
  scale: number
  name: string
  value: string
  rule: string
}

const AlertValue = ({ scale, value }: { scale: number; value: string }) => (
  <div
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      fontSize: ALERT_VALUE_PX * scale,
      lineHeight: 0.9,
      letterSpacing: '-0.045em',
      marginTop: 5 * scale,
    }}
  >
    {value}
  </div>
)

const AlertFooter = ({ scale }: { scale: number }) => (
  <div
    className="mt-auto font-sans font-extrabold uppercase"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      borderTop: `${String(RULE_PX * scale)}px solid rgba(255,255,255,0.5)`,
      paddingTop: 7 * scale,
      fontSize: ALERT_FOOTER_PX * scale,
      letterSpacing: '0.14em',
    }}
  >
    STOP THE ENGINE
  </div>
)

export const AlertTakeover = ({ scale, name, value, rule }: AlertTakeoverProps) => (
  <div
    className="absolute inset-0 z-3 flex flex-col text-white"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ background: CS_DANGER, padding: 4 * scale }}
  >
    <div
      className="font-sans font-extrabold uppercase"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: ALERT_NAME_PX * scale, letterSpacing: '0.16em' }}
    >
      {name}
    </div>
    <AlertValue scale={scale} value={value} />
    <div
      className="opacity-85"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: ALERT_RULE_PX * scale, marginTop: 10 * scale }}
    >
      {rule}
    </div>
    <AlertFooter scale={scale} />
  </div>
)
