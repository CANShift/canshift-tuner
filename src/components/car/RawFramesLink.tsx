import { Link } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { UiIcon } from '../icons/UiIcons'

export const RAW_FRAMES_PATH = '/car/frames'

export const RawFramesLink = () => (
  <Link
    to={RAW_FRAMES_PATH}
    className="flex min-h-[52px] items-center gap-3 rounded-[12px] border border-app-border px-3.5 text-app-secondary lg:py-2 no-underline"
  >
    <span className="flex flex-1 flex-col">
      <span className="text-[15px]">{STRINGS.car.rawFrames}</span>
      <span className="text-xs text-app-muted lg:text-sm">{STRINGS.car.rawFramesHint}</span>
    </span>
    <UiIcon name="chevronRight" className="text-app-muted" />
  </Link>
)
