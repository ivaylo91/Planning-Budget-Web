import { useMemo, useState } from 'react'
import { useStoredState, STORAGE_KEYS } from '../lib/storage'
import type { PurchaseRecord } from '../lib/types'
import { formatDate } from '../lib/period'
import { formatEUR } from '../lib/format'
import { IconChevronRight } from '../lib/icons'

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
  const [purchases] = useStoredState<PurchaseRecord[]>(STORAGE_KEYS.purchases, [])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const months = useMemo(() => groupByMonth(purchases), [purchases])
  const maxMonthSpent = useMemo(() => Math.max(0, ...months.map((m) => m.spent)), [months])

  if (purchases.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-[22px] font-bold text-app-text tracking-tight py-2">История</h1>
        <p className="text-sm text-app-text-sec text-center py-8">
          Все още няма приключени пазарувания. Завършете списък от страница „Списък“, за да видите запис тук.
        </p>
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
      <h1 className="text-[22px] font-bold text-app-text tracking-tight py-2 m-0">История</h1>
      <p className="text-sm text-app-text-sec -mt-1 mb-3">Всички приключени пазарувания, с похарчено и спестено.</p>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="bg-app-card rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-sec mb-0.5">Общо похарчено</p>
          <p className="text-[22px] font-extrabold text-app-text tracking-tight">{formatEUR(totalSpent)}</p>
        </div>
        <div className="bg-app-card rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-sec mb-0.5">Общо спестено</p>
          <p className="text-[22px] font-extrabold text-accent tracking-tight">{formatEUR(totalSaved)}</p>
        </div>
        <div className="bg-app-card rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-sec mb-0.5">Пазарувания</p>
          <p className="text-[22px] font-extrabold text-app-text tracking-tight">{trips}</p>
          <p className="text-[11px] text-app-text-sec mt-0.5">средно {formatEUR(avgPerTrip)} на пазаруване</p>
        </div>
        <div className="bg-app-card rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-sec mb-0.5">Спестено спрямо общо</p>
          <p className="text-[22px] font-extrabold text-accent tracking-tight">{savingsRate.toFixed(0)}%</p>
          <p className="text-[11px] text-app-text-sec mt-0.5">от стойността по обичайни цени</p>
        </div>
      </div>

      {months.length > 1 && (
        <div className="bg-app-card rounded-2xl border border-app-border p-4 space-y-3 mb-2">
          <h3 className="text-sm font-bold text-app-text">По месеци</h3>
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
        </div>
      )}

      <div className="text-xs font-bold uppercase tracking-wide text-app-text-sec pt-3 pb-2">Последни пазарувания</div>
      <div className="flex flex-col gap-1.5 pb-4">
        {purchases.map((purchase) => {
          const expanded = expandedId === purchase.id
          return (
            <div key={purchase.id}>
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : purchase.id)}
                className="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl bg-app-card border border-app-border w-full text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent text-white text-base">
                  🛒
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-app-text">{formatDate(new Date(purchase.date))}</div>
                  <div className="text-xs text-app-text-sec mt-0.5">{purchase.items.length} продукта</div>
                </div>
                <div className="text-[15px] font-bold text-app-text mr-1">{formatEUR(purchase.total)}</div>
                {purchase.saved > 0 && (
                  <div className="text-xs font-semibold text-accent">+{formatEUR(purchase.saved)}</div>
                )}
                <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                  <IconChevronRight size={16} color="var(--color-app-text-sec)" />
                </div>
              </button>

              {expanded && (
                <div className="-mt-1 mb-2 ml-5 mr-2 px-3.5 py-2.5 rounded-b-xl border border-t-0 border-app-border bg-app-card">
                  {purchase.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 py-2 ${idx < purchase.items.length - 1 ? 'border-b border-app-border' : ''}`}
                    >
                      <span className="text-[13px] text-app-text">{item.name}</span>
                      <span className="text-xs text-app-text-sec">×{item.quantity}</span>
                      <span className="text-[13px] font-semibold text-app-text ml-auto">
                        {formatEUR(item.actualPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
