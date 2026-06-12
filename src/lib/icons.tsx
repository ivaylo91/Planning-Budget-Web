import {
  House,
  Tag,
  ClipboardText,
  Clock,
  Wallet,
  Plus,
  Minus,
  Trash,
  Check,
  CaretRight,
  Bell,
  MagnifyingGlass,
  ShoppingCart,
  User,
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  ArrowClockwise,
  Flame,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'

interface IconProps {
  size?: number
  color?: string
}

function makeIcon(Icon: PhosphorIcon) {
  return ({ size = 24, color = 'currentColor' }: IconProps) => (
    <Icon size={size} color={color} weight="light" />
  )
}

export const IconHome = makeIcon(House)
export const IconTag = makeIcon(Tag)
export const IconList = makeIcon(ClipboardText)
export const IconClock = makeIcon(Clock)
export const IconWallet = makeIcon(Wallet)
export const IconPlus = makeIcon(Plus)
export const IconMinus = makeIcon(Minus)
export const IconTrash = makeIcon(Trash)
export const IconCheck = makeIcon(Check)
export const IconChevronRight = makeIcon(CaretRight)
export const IconBell = makeIcon(Bell)
export const IconSearch = makeIcon(MagnifyingGlass)
export const IconCart = makeIcon(ShoppingCart)
export const IconUser = makeIcon(User)
export const IconMail = makeIcon(EnvelopeSimple)
export const IconLock = makeIcon(Lock)
export const IconEye = makeIcon(Eye)
export const IconEyeSlash = makeIcon(EyeSlash)
export const IconRefresh = makeIcon(ArrowClockwise)
export const IconFlame = makeIcon(Flame)
