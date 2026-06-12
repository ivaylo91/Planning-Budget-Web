import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSyncedState } from '../lib/sync'
import { DEFAULT_BUDGET, type Budget, type Promotion, type PurchaseRecord } from '../lib/types'
import { formatDate, getCurrentPeriod, purchasesInPeriod } from '../lib/period'
import { formatEUR } from '../lib/format'
import { notifyOnce } from '../lib/notifications'
import { isPromotionActive, loadPromotions } from '../lib/promotions'
import { categoryIcon } from '../lib/catalogVisuals'
import { IconBell, IconTag, IconList, IconClock, IconWallet, IconRefresh } from '../lib/icons'
import BudgetRing from '../components/BudgetRing'

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

type PromoState = 'loading' | 'ready' | 'error'

export default function DashboardPage() {
  const [budget] = useSyncedState<Budget>('budget', DEFAULT_BUDGET)
  const [purchases] = useSyncedState<PurchaseRecord[]>('purchases', [])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [promoState, setPromoState] = useState<PromoState>('loading')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadPromotions()
      .then((data) => {
        if (cancelled) return
        setPromotions(data)
        setPromoState('ready')
      })
      .catch(() => {
        if (!cancelled) setPromoState('error')
      })
    return () => {
      cancelled = true
    }
  }, [retryKey])

  function retryPromotions() {
    setPromoState('loading')
    setRetryKey((key) => key + 1)
  }

  const hotPromos = useMemo(
    () => promotions.filter((promo) => isPromotionActive(promo)).slice(0, 4),
    [promotions],
  )

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

  const alerts = useMemo(() => {
    const list: { id: string; title: string; body: string }[] = []
    if (budget.amount > 0) {
      const ratio = spent / budget.amount
      for (const threshold of BUDGET_THRESHOLDS) {
        if (ratio >= threshold.ratio) {
          list.push({
            id: `budget-${threshold.label}`,
            title: threshold.message,
            body: `Изразходвахте ${formatEUR(spent)} от бюджета си от ${formatEUR(budget.amount)} за ${PERIOD_LABEL[budget.period]}.`,
          })
          break
        }
      }
    }
    if (hotPromos.length > 0) {
      list.push({
        id: 'promos',
        title: 'Активни промоции',
        body: `${hotPromos.length} промоции в каталога са активни в момента.`,
      })
    }
    return list
  }, [budget.amount, budget.period, spent, hotPromos.length])

  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  if (!budget.amount) {
    return (
      <div className="bg-app-card rounded-2xl border border-app-border p-6 text-center space-y-3 mt-4">
        <h2 className="text-lg font-bold text-app-text">Добре дошли в Пазарувай умно 👋</h2>
        <p className="text-sm text-app-text-sec">
          За да започнем, задайте бюджет — сума и период (седмично или месечно), спрямо които ще следим разходите ви.
        </p>
        <Link
          to="/budget"
          className="pressable inline-block rounded-xl bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-dark transition-colors"
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
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            aria-label="Известия"
            aria-expanded={notifOpen}
            className="pressable relative w-[42px] h-[42px] rounded-2xl flex items-center justify-center bg-app-card border border-app-border"
          >
            <IconBell size={20} color="var(--color-accent)" />
            {alerts.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent border-2 border-app-card" />
            )}
          </button>
          {notifOpen && (
            <div className="notif-panel absolute right-0 top-[50px] w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-app-card border border-app-border shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-2 z-10">
              <div className="text-[11px] font-semibold text-app-text-sec uppercase tracking-wide px-3 pt-2 pb-1">
                Известия
              </div>
              {alerts.length === 0 ? (
                <p className="text-xs text-app-text-sec px-3 py-3">Всичко е спокойно — няма нови известия.</p>
              ) : (
                <div className="flex flex-col gap-0.5 pb-1">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl px-3 py-2.5">
                      <div className="text-[13px] font-semibold text-app-text">{alert.title}</div>
                      <div className="text-xs text-app-text-sec mt-0.5">{alert.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Budget card */}
      <div
        className="rounded-[20px] px-[22px] pt-6 pb-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] mt-3"
        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
      >
        <div className="text-[13px] opacity-85 mb-1">Оставащ бюджет</div>
        <div className="text-[38px] font-extrabold tracking-tight leading-tight tabular-nums">
          {formatEUR(animRemaining)}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed border-white/25">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs tabular-nums">
            <div className="flex justify-between opacity-80">
              <span>Похарчени</span>
              <span className="font-semibold">{formatEUR(animSpent)}</span>
            </div>
            <div className="flex justify-between opacity-80">
              <span>Бюджет</span>
              <span className="font-semibold">{formatEUR(budget.amount)}</span>
            </div>
            <div className="opacity-60 pt-1 leading-snug">
              {formatDate(period.start)} – {formatDate(new Date(period.end.getTime() - 1))} ({PERIOD_LABEL[budget.period]})
            </div>
          </div>
          <BudgetRing percent={pct} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="text-base font-bold text-app-text mt-6 mb-3 tracking-tight">Бързи действия</div>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="pressable flex flex-col items-center px-3 pt-[18px] pb-3.5 rounded-2xl bg-app-card border border-app-border transition-colors active:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
      {promoState === 'loading' && (
        <>
          <div className="text-base font-bold text-app-text mt-6 mb-3 tracking-tight">Горещи промоции 🔥</div>
          <div className="flex flex-col gap-2.5 pb-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-app-card border border-app-border animate-pulse"
              >
                <div className="w-[52px] h-[52px] rounded-2xl bg-app-border shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-app-border" />
                  <div className="h-2.5 w-1/3 rounded bg-app-border" />
                </div>
                <div className="h-4 w-12 rounded bg-app-border shrink-0" />
              </div>
            ))}
          </div>
        </>
      )}

      {promoState === 'error' && (
        <>
          <div className="text-base font-bold text-app-text mt-6 mb-3 tracking-tight">Горещи промоции 🔥</div>
          <div className="rounded-2xl bg-app-card border border-app-border px-4 py-5 text-center">
            <p className="text-sm text-app-text-sec mb-3">Промоциите не успяха да се заредят.</p>
            <button
              type="button"
              onClick={retryPromotions}
              className="pressable inline-flex items-center gap-2 rounded-xl bg-accent/10 text-accent text-sm font-semibold px-4 py-2"
            >
              <IconRefresh size={14} color="var(--color-accent)" />
              Опитай отново
            </button>
          </div>
        </>
      )}

      {promoState === 'ready' && hotPromos.length > 0 && (
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
