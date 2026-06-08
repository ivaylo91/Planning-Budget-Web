import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSyncedState } from '../lib/sync'
import { DEFAULT_BUDGET, type Budget, type Promotion, type PurchaseRecord } from '../lib/types'
import { formatDate, getCurrentPeriod, purchasesInPeriod } from '../lib/period'
import { formatEUR } from '../lib/format'
import { notifyOnce } from '../lib/notifications'
import { isPromotionActive, loadPromotions } from '../lib/promotions'
import { categoryIcon } from '../lib/catalogVisuals'
import { IconBell, IconTag, IconList, IconClock, IconWallet } from '../lib/icons'

const BUDGET_THRESHOLDS = [
  { ratio: 1, label: '100%', message: 'Достигнахте бюджета си' },
  { ratio: 0.8, label: '80%', message: 'Наближавате бюджета си' },
]

const PERIOD_LABEL: Record<Budget['period'], string> = {
  weekly: 'тази седмица',
  monthly: 'този месец',
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Добро утро'
  if (hour < 18) return 'Добър ден'
  return 'Добра вечер'
}

function useAnimatedNumber(target: number): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const duration = 900
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

export default function DashboardPage() {
  const [budget] = useSyncedState<Budget>('budget', DEFAULT_BUDGET)
  const [purchases] = useSyncedState<PurchaseRecord[]>('purchases', [])
  const [promotions, setPromotions] = useState<Promotion[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPromotions()
      .then((data) => {
        if (!cancelled) setPromotions(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const hotPromos = useMemo(() => {
    if (!promotions) return []
    return promotions.filter((promo) => isPromotionActive(promo)).slice(0, 4)
  }, [promotions])

  const period = getCurrentPeriod(budget)
  const periodPurchases = purchasesInPeriod(purchases, period)
  const spent = periodPurchases.reduce((sum, p) => sum + p.total, 0)
  const remaining = budget.amount - spent
  const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

  const animRemaining = useAnimatedNumber(remaining)
  const animSpent = useAnimatedNumber(spent)

  useEffect(() => {
    if (!budget.amount) return
    const periodKey = period.start.toISOString().slice(0, 10)
    const actualRatio = spent / budget.amount
    for (const threshold of BUDGET_THRESHOLDS) {
      if (actualRatio >= threshold.ratio) {
        notifyOnce(
          `budget-${periodKey}-${threshold.label}`,
          `Пазарувай умно — ${threshold.message}`,
          `Изразходвахте ${formatEUR(spent)} от бюджета си от ${formatEUR(budget.amount)} за ${PERIOD_LABEL[budget.period]}.`,
        )
        break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.start.getTime(), spent, budget.amount, budget.period])

  if (!budget.amount) {
    return (
      <div className="bg-app-card rounded-2xl border border-app-border p-6 text-center space-y-3 mt-4">
        <h2 className="text-lg font-bold text-app-text">Добре дошли в Пазарувай умно 👋</h2>
        <p className="text-sm text-app-text-sec">
          За да започнем, задайте бюджет — сума и период (седмично или месечно), спрямо които ще следим разходите ви.
        </p>
        <Link
          to="/budget"
          className="inline-block rounded-xl bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-dark transition-colors"
        >
          Задай бюджет
        </Link>
      </div>
    )
  }

  const quickActions = [
    { icon: IconTag, label: 'Промоции', to: '/promotions', count: hotPromos.length || null },
    { icon: IconList, label: 'Списък', to: '/list', count: null },
    { icon: IconClock, label: 'История', to: '/history', count: null },
    { icon: IconWallet, label: 'Бюджет', to: '/budget', count: null },
  ]

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-[13px] text-app-text-sec mb-0.5">{greeting()} 👋</div>
          <div className="text-[22px] font-bold text-app-text tracking-tight">Пазарувай умно</div>
        </div>
        <button
          type="button"
          className="relative w-[42px] h-[42px] rounded-2xl flex items-center justify-center bg-app-card border border-app-border"
        >
          <IconBell size={20} color="var(--color-accent)" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent border-2 border-app-card" />
        </button>
      </div>

      {/* Budget card */}
      <div
        className="rounded-[20px] px-[22px] pt-6 pb-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] mt-3"
        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
      >
        <div className="text-[13px] opacity-85 mb-1">Оставащ бюджет</div>
        <div className="text-[38px] font-extrabold tracking-tight leading-tight">{formatEUR(animRemaining)}</div>
        <div className="h-1.5 rounded-full bg-white/25 my-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: `${Math.min(100, pct)}%`, background: pct > 80 ? '#FF4444' : 'rgba(255,255,255,0.5)' }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-80">
          <span>Похарчени: {formatEUR(animSpent)}</span>
          <span>Бюджет: {formatEUR(budget.amount)}</span>
        </div>
      </div>
      <p className="text-xs text-app-text-sec mt-2">
        Период: {formatDate(period.start)} – {formatDate(new Date(period.end.getTime() - 1))} ({PERIOD_LABEL[budget.period]})
      </p>

      {/* Quick actions */}
      <div className="text-base font-bold text-app-text mt-6 mb-3 tracking-tight">Бързи действия</div>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center px-3 pt-[18px] pb-3.5 rounded-2xl bg-app-card border border-app-border hover:shadow-sm transition-shadow"
            >
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-accent/10">
                <Icon size={22} color="var(--color-accent)" />
                {action.count && (
                  <span className="absolute -top-1 -right-1.5 text-[10px] font-bold text-white bg-accent px-1.5 rounded-full min-w-[18px] text-center">
                    {action.count}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-app-text">{action.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Hot promos */}
      {hotPromos.length > 0 && (
        <>
          <div className="text-base font-bold text-app-text mt-6 mb-3 tracking-tight">Горещи промоции 🔥</div>
          <div className="flex flex-col gap-2.5 pb-2">
            {hotPromos.map((promo) => (
              <div key={promo.id} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-app-card border border-app-border">
                <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 bg-accent/10">
                  <span className="text-[28px]">{categoryIcon(promo.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-app-text truncate">{promo.product}</div>
                  <div className="text-xs text-app-text-sec mt-0.5">{promo.store}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-app-text-sec line-through">{formatEUR(promo.regularPrice)}</div>
                  <div className="text-base font-bold text-accent">{formatEUR(promo.promoPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
