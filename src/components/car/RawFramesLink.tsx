import { Link } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { ROW_LINK, RowLinkLabel } from './RowLinkLabel'

export const RAW_FRAMES_PATH = '/car/frames'

export const RawFramesLink = () => (
  <Link to={RAW_FRAMES_PATH} className={ROW_LINK}>
    <RowLinkLabel title={STRINGS.car.rawFrames} hint={STRINGS.car.rawFramesHint} />
  </Link>
)
