import { useState } from 'react'
import { useSyncedState } from '../lib/sync'
import { DEFAULT_BUDGET, type Budget, type BudgetPeriod, type PurchaseRecord } from '../lib/types'
import { getCurrentPeriod, purchasesInPeriod } from '../lib/period'
import { formatEUR } from '../lib/format'
import {
  disableNotifications,
  enableNotifications,
  notificationsEnabled,
  notificationsSupported,
} from '../lib/notifications'

const PRESETS: Record<BudgetPeriod, number[]> = {
  weekly: [50, 75, 100, 150],
  monthly: [200, 300, 400, 600],
}

export default function BudgetSetupPage() {
  const [budget, setBudget] = useSyncedState<Budget>('budget', DEFAULT_BUDGET)
  const [purchases] = useSyncedState<PurchaseRecord[]>('purchases', [])
  const [amount, setAmount] = useState(String(budget.amount || ''))
  const [startDate, setStartDate] = useState(budget.startDate)
  const [saved, setSaved] = useState(false)

  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled())
  const [notifError, setNotifError] = useState<string | null>(null)

  const period = getCurrentPeriod(budget)
  const spent = budget.amount ? purchasesInPeriod(purchases, period).reduce((sum, p) => sum + p.total, 0) : 0
  const remaining = budget.amount - spent
  const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

  const radius = 62
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (circumference * Math.min(pct, 100)) / 100

  function applyAmount(value: number, periodOverride?: BudgetPeriod) {
    const nextPeriod = periodOverride ?? budget.period
    setBudget({ amount: value, period: nextPeriod, startDate })
    setAmount(String(value))
  }

  function handlePeriodChange(nextPeriod: BudgetPeriod) {
    if (nextPeriod === budget.period) return
    const nextAmount = nextPeriod === 'weekly' && budget.amount > 200
      ? 100
      : nextPeriod === 'monthly' && budget.amount < 200
        ? 400
        : budget.amount
    setBudget({ amount: nextAmount, period: nextPeriod, startDate })
    setAmount(String(nextAmount))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed <= 0) return
    setBudget({ amount: parsed, period: budget.period, startDate })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function toggleNotifications() {
    setNotifError(null)
    if (notifEnabled) {
      disableNotifications()
      setNotifEnabled(false)
      return
    }
    const granted = await enableNotifications()
    if (!granted) {
      setNotifError('Браузърът отказа разрешение за известия. Може да го промените от настройките му.')
    }
    setNotifEnabled(granted)
  }

  return (
    <div className="space-y-1">
      <h1 className="text-[22px] font-bold text-app-text tracking-tight py-2 m-0">Бюджет</h1>

      {/* Period toggle */}
      <div className="flex p-1 rounded-2xl bg-app-card border border-app-border mb-4">
        {(['weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handlePeriodChange(type)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              budget.period === type ? 'bg-accent text-white' : 'text-app-text-sec'
            }`}
          >
            {type === 'weekly' ? 'Седмичен' : 'Месечен'}
          </button>
        ))}
      </div>

      {budget.amount > 0 && (
        <div className="rounded-[18px] bg-app-card border border-app-border px-5 py-6 text-center mb-4">
          <div className="relative inline-block mb-4">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--color-app-border)" strokeWidth={stroke} />
              <circle
                cx="75" cy="75" r={radius} fill="none"
                stroke={pct > 90 ? '#EF4444' : 'var(--color-accent)'}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-[28px] font-extrabold tracking-tight ${pct > 90 ? 'text-red-500' : 'text-app-text'}`}>{pct}%</div>
              <div className="text-[11px] text-app-text-sec">използвани</div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-5">
            <div className="text-center">
              <div className="text-xl font-extrabold tracking-tight text-accent">{formatEUR(spent)}</div>
              <div className="text-xs text-app-text-sec mt-0.5">Похарчени</div>
            </div>
            <div className="w-px h-9 bg-app-border" />
            <div className="text-center">
              <div className={`text-xl font-extrabold tracking-tight ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatEUR(remaining)}
              </div>
              <div className="text-xs text-app-text-sec mt-0.5">Оставащи</div>
            </div>
          </div>
        </div>
      )}

      {/* Set budget */}
      <form onSubmit={handleSubmit} className="bg-app-card rounded-2xl border border-app-border px-5 py-[18px] mb-4">
        <div className="text-[15px] font-bold text-app-text mb-3">Задай бюджет</div>
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-xl font-bold text-accent">€</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="напр. 300"
            className="flex-1 text-xl font-bold text-app-text px-3.5 py-2.5 rounded-xl border-[1.5px] border-app-border bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="flex gap-2 mb-1">
          {PRESETS[budget.period].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyAmount(preset)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border-[1.5px] transition-colors ${
                budget.amount === preset
                  ? 'bg-accent text-white border-accent'
                  : 'text-app-text-sec border-app-border'
              }`}
            >
              €{preset}
            </button>
          ))}
        </div>

        <div className="mt-3.5">
          <label className="block text-xs font-medium text-app-text-sec mb-1">Начална дата на периода</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 rounded-xl bg-accent text-white text-sm font-semibold py-2.5 hover:bg-accent-dark transition-colors"
        >
          Запази бюджета
        </button>
        {saved && <p className="text-sm text-accent text-center mt-2">Бюджетът е запазен ✓</p>}
      </form>

      {/* Tip */}
      <div className="rounded-2xl px-[18px] py-4 mb-4 bg-accent/10 border border-accent/25">
        <div className="text-xl mb-1.5">💡</div>
        <div className="text-sm font-bold text-app-text mb-1">Съвет</div>
        <div className="text-[13px] leading-relaxed text-app-text-sec">
          {pct > 80
            ? 'Наближаваш лимита! Провери промоциите за по-изгодни цени.'
            : 'Използвай промоциите, за да пестиш от бюджета си всяка седмица.'}
        </div>
      </div>

      {notificationsSupported() && (
        <div className="bg-app-card rounded-2xl border border-app-border p-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-app-text">Известия в браузъра</h3>
              <p className="text-xs text-app-text-sec mt-0.5">
                Получавайте сигнал, когато наближите лимита на бюджета си или когато продукт от списъка ви е в промоция.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleNotifications}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                notifEnabled ? 'bg-accent text-white' : 'bg-app-bg text-app-text-sec'
              }`}
            >
              {notifEnabled ? 'Включени ✓' : 'Включи известия'}
            </button>
          </div>
          {notifError && <p className="text-xs text-red-600">{notifError}</p>}
        </div>
      )}
    </div>
  )
}
