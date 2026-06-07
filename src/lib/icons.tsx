import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faHouse,
  faTag,
  faClipboardList,
  faClock,
  faWallet,
  faPlus,
  faMinus,
  faTrashCan,
  faCheck,
  faChevronRight,
  faBell,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'

interface IconProps {
  size?: number
  color?: string
}

function makeIcon(icon: IconDefinition) {
  return ({ size = 24, color = 'currentColor' }: IconProps) => (
    <FontAwesomeIcon icon={icon} style={{ width: size, height: size, color }} />
  )
}

export const IconHome = makeIcon(faHouse)
export const IconTag = makeIcon(faTag)
export const IconList = makeIcon(faClipboardList)
export const IconClock = makeIcon(faClock)
export const IconWallet = makeIcon(faWallet)
export const IconPlus = makeIcon(faPlus)
export const IconMinus = makeIcon(faMinus)
export const IconTrash = makeIcon(faTrashCan)
export const IconCheck = makeIcon(faCheck)
export const IconChevronRight = makeIcon(faChevronRight)
export const IconBell = makeIcon(faBell)
export const IconSearch = makeIcon(faMagnifyingGlass)
