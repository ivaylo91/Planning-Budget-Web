import { useMemo, useState } from 'react'
import { useSyncedState } from '../lib/sync'
import type { PurchaseRecord } from '../lib/types'
import { formatDate } from '../lib/period'
import { formatEUR } from '../lib/format'
import { IconCart, IconChevronRight } from '../lib/icons'
import Bezel from '../components/Bezel'
import Reveal from '../components/Reveal'

interface MonthGroup {
  key: string
  label: string
  spent: number
  saved: number
  trips: number
}

function monthKey(dateIso: string): string {
  const date = new Date(dateIso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(dateIso: string): string {
  const date = new Date(dateIso)
  const label = date.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function groupByMonth(purchases: PurchaseRecord[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>()
  for (const purchase of purchases) {
    const key = monthKey(purchase.date)
    const group = groups.get(key) ?? { key, label: monthLabel(purchase.date), spent: 0, saved: 0, trips: 0 }
    group.spent += purchase.total
    group.saved += purchase.saved
    group.trips += 1
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

export default function HistoryPage() {
  const [purchases] = useSyncedState<PurchaseRecord[]>('purchases', [])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const months = useMemo(() => groupByMonth(purchases), [purchases])
  const maxMonthSpent = useMemo(() => Math.max(0, ...months.map((m) => m.spent)), [months])

  if (purchases.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-[22px] font-display font-bold text-app-text tracking-tight py-2">История</h1>
        <div className="text-center py-12 px-5">
          <IconCart size={48} color="var(--color-app-text-sec)" />
          <p className="text-sm text-app-text-sec mt-3 max-w-[32ch] mx-auto">
            Все още няма приключени пазарувания. Завършете списък от раздел „Списък“, за да видите запис тук.
          </p>
        </div>
      </div>
    )
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0)
  const totalSaved = purchases.reduce((sum, p) => sum + p.saved, 0)
  const trips = purchases.length
  const avgPerTrip = totalSpent / trips
  const savingsRate = totalSpent + totalSaved > 0 ? (totalSaved / (totalSpent + totalSaved)) * 100 : 0

  return (
    <div className="space-y-1">
      <h1 className="text-[22px] font-display font-bold text-app-text tracking-tight py-2 m-0">История</h1>
      <p className="text-sm text-app-text-sec -mt-1 mb-3">Всички приключени пазарувания, с похарчено и спестено.</p>

      {/* Stats — asymmetric bento: headline tile + 2-up row */}
      <Reveal>
        <Bezel variant="full" className="bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs opacity-80 mb-0.5">Общо похарчено</p>
            <p className="text-[28px] font-display font-extrabold tracking-tight tabular-nums">{formatEUR(totalSpent)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80 mb-0.5">Общо спестено</p>
            <p className="text-[28px] font-display font-extrabold tracking-tight tabular-nums">{formatEUR(totalSaved)}</p>
          </div>
        </Bezel>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Bezel variant="flat" className="bg-app-card p-4">
            <p className="text-xs text-app-text-sec mb-0.5">Пазарувания</p>
            <p className="text-[22px] font-display font-extrabold text-app-text tracking-tight tabular-nums">{trips}</p>
            <p className="text-[11px] text-app-text-sec mt-0.5">средно {formatEUR(avgPerTrip)} на пазаруване</p>
          </Bezel>
          <Bezel variant="flat" className="bg-app-card p-4">
            <p className="text-xs text-app-text-sec mb-0.5">Спестено спрямо общо</p>
            <p className="text-[22px] font-display font-extrabold text-accent tracking-tight tabular-nums">{savingsRate.toFixed(0)}%</p>
            <p className="text-[11px] text-app-text-sec mt-0.5">от стойността по обичайни цени</p>
          </Bezel>
        </div>
      </Reveal>

      {months.length > 1 && (
        <Reveal className="mt-3">
          <Bezel variant="flat" className="bg-app-card p-4 space-y-3">
            <h3 className="text-sm font-display font-bold text-app-text">По месеци</h3>
            <ul className="space-y-2.5">
              {months.map((month) => (
                <li key={month.key} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                    <span className="font-semibold text-app-text">{month.label}</span>
                    <span className="text-app-text-sec text-xs">
                      {formatEUR(month.spent)} похарчено
                      {month.saved > 0 && <span className="text-accent"> · {formatEUR(month.saved)} спестено</span>}
                      {' '}· {month.trips} {month.trips === 1 ? 'пазаруване' : 'пазарувания'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-app-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${maxMonthSpent > 0 ? (month.spent / maxMonthSpent) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Bezel>
        </Reveal>
      )}

      <div className="text-xs font-bold uppercase tracking-wide text-app-text-sec pt-6 pb-2">Последни пазарувания</div>
      <Reveal className="flex flex-col gap-1.5 pb-4">
        {purchases.map((purchase) => {
          const expanded = expandedId === purchase.id
          return (
            <div key={purchase.id}>
              <Bezel variant="flat" className="bg-app-card">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : purchase.id)}
                  className="pressable flex items-center gap-3 px-3.5 py-3.5 w-full text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent text-white">
                    <IconCart size={18} color="#fff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-app-text">{formatDate(new Date(purchase.date))}</div>
                    <div className="text-xs text-app-text-sec mt-0.5">{purchase.items.length} продукта</div>
                  </div>
                  <div className="text-[15px] font-bold text-app-text mr-1 tabular-nums">{formatEUR(purchase.total)}</div>
                  {purchase.saved > 0 && (
                    <div className="text-xs font-semibold text-accent tabular-nums">+{formatEUR(purchase.saved)}</div>
                  )}
                  <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                    <IconChevronRight size={16} color="var(--color-app-text-sec)" />
                  </div>
                </button>

                {expanded && (
                  <div className="px-3.5 pb-3 -mt-1">
                    {purchase.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 py-2 ${idx < purchase.items.length - 1 ? 'border-b border-app-border' : ''}`}
                      >
                        <span className="text-[13px] text-app-text">{item.name}</span>
                        <span className="text-xs text-app-text-sec">×{item.quantity}</span>
                        <span className="text-[13px] font-semibold text-app-text ml-auto tabular-nums">
                          {formatEUR(item.actualPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Bezel>
            </div>
          )
        })}
      </Reveal>
    </div>
  )
}
