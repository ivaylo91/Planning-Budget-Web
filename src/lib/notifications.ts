const ENABLED_KEY = 'pu_notifications_enabled'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationsEnabled(): boolean {
  return notificationsSupported() && localStorage.getItem(ENABLED_KEY) === 'true' && Notification.permission === 'granted'
}

export async function enableNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false
  const permission = await Notification.requestPermission()
  const granted = permission === 'granted'
  localStorage.setItem(ENABLED_KEY, granted ? 'true' : 'false')
  return granted
}

export function disableNotifications(): void {
  localStorage.setItem(ENABLED_KEY, 'false')
}

const SEEN_KEY = 'pu_notified_keys'

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

/** Ensures a notification for `key` fires at most once (e.g. one alert per budget threshold per period, one per promo). */
export function notifyOnce(key: string, title: string, body: string): void {
  const seen = readSeen()
  if (seen.has(key)) return
  seen.add(key)
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
  notify(title, body)
}

export function notify(title: string, body: string): void {
  if (!notificationsEnabled()) return
  try {
    new Notification(title, { body, icon: '/icon-192.png' })
  } catch {
    // Some browsers (mostly mobile) require a service worker registration to show notifications — ignore failures.
  }
}
