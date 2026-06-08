import { useEffect, useMemo, useState } from 'react'
import { useSyncedState } from '../lib/sync'
import { discountPercent, findMatchingPromotions, isPromotionActive, loadPromotions } from '../lib/promotions'
import type { Promotion, ShoppingListItem } from '../lib/types'
import { formatEUR } from '../lib/format'
import { notifyOnce } from '../lib/notifications'
import { categoryIcon } from '../lib/catalogVisuals'
import { IconCheck, IconPlus, IconSearch } from '../lib/icons'

const STORE_ORDER = ['Billa', 'Lidl', 'Kaufland', 'Fantastiko', 'T Market', 'Metro', 'CBA']

type SortMode = 'discount' | 'price'

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState<string>('Всички')
  const [catFilter, setCatFilter] = useState<string>('Всички')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('discount')
  const [justAddedIds, setJustAddedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  const [items, setItems] = useSyncedState<ShoppingListItem[]>('shoppingList', [])

  useEffect(() => {
    let cancelled = false
    loadPromotions()
      .then((data) => {
        if (!cancelled) setPromotions(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Грешка при зареждане')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Notify (once per promo) when an active promo matches something already on the user's shopping list.
  useEffect(() => {
    if (!promotions) return
    const active = promotions.filter((promo) => isPromotionActive(promo))
    for (const item of items) {
      if (item.purchased || item.store) continue
      const match = findMatchingPromotions(item.name, active)[0]
      if (!match) continue
      notifyOnce(
        `promo-match-${match.id}-${item.id}`,
        'Пазарувай умно — намерена промоция',
        `„${item.name}“ от списъка ви е в промоция в ${match.store}: ${match.product} за ${formatEUR(match.promoPrice)} (вместо ${formatEUR(match.regularPrice)}).`,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotions, items])

  const stores = useMemo(() => {
    if (!promotions) return []
    const present = new Set(promotions.map((p) => p.store))
    return ['Всички', ...STORE_ORDER.filter((store) => present.has(store))]
  }, [promotions])

  const categories = useMemo(() => {
    if (!promotions) return []
    return ['Всички', ...Array.from(new Set(promotions.map((p) => p.category))).sort()]
  }, [promotions])

  const filtered = useMemo(() => {
    if (!promotions) return []
    const query = search.trim().toLowerCase()
    return promotions
      .filter((promo) => storeFilter === 'Всички' || promo.store === storeFilter)
      .filter((promo) => catFilter === 'Всички' || promo.category === catFilter)
      .filter((promo) => !query || promo.product.toLowerCase().includes(query))
      .sort((a, b) =>
        sortMode === 'discount'
          ? discountPercent(b) - discountPercent(a)
          : a.promoPrice - b.promoPrice,
      )
  }, [promotions, storeFilter, catFilter, search, sortMode])

  const grouped = useMemo(() => {
    const groups = new Map<string, Promotion[]>()
    for (const promo of filtered) {
      const key = storeFilter === 'Всички' ? promo.store : promo.category
      const list = groups.get(key) ?? []
      list.push(promo)
      groups.set(key, list)
    }
    return [...groups.entries()]
  }, [filtered, storeFilter])

  const listIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  function showToast(message: string) {
    setToast({ message, visible: true })
    window.setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000)
    window.setTimeout(() => setToast({ message: '', visible: false }), 2400)
  }

  function addToList(promo: Promotion) {
    setItems((prev) => [
      ...prev,
      {
        id: promo.id,
        name: promo.product,
        quantity: 1,
        estimatedPrice: promo.promoPrice,
        purchased: false,
        store: promo.store,
        referencePrice: promo.regularPrice,
      },
    ])
    setJustAddedIds((prev) => new Set(prev).add(promo.id))
    window.setTimeout(() => {
      setJustAddedIds((prev) => {
        const next = new Set(prev)
        next.delete(promo.id)
        return next
      })
    }, 1500)
    showToast(`${promo.product} добавен в списъка`)
  }

  return (
    <div className="space-y-1 relative">
      {toast.message && (
        <div
          className={`absolute -top-1 left-0 right-0 z-20 flex items-center gap-2 rounded-2xl bg-accent text-white px-4 py-3 text-[13px] font-semibold shadow-lg transition-[opacity,transform] duration-300 ease-out ${
            toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          <IconCheck size={16} color="#fff" />
          {toast.message}
        </div>
      )}

      <div className="flex items-baseline justify-between py-2">
        <h1 className="text-[22px] font-bold text-app-text tracking-tight m-0">Промоции</h1>
        {promotions && <span className="text-[13px] font-semibold text-accent">{promotions.length} оферти</span>}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {!promotions && !error && (
        <p className="text-sm text-app-text-sec text-center py-8">Зареждане на каталога…</p>
      )}

      {promotions && (
        <>
          {/* Search */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-app-card border border-app-border px-3.5 py-2.5 mb-3">
            <IconSearch size={18} color="var(--color-app-text-sec)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси продукт..."
              className="flex-1 border-none outline-none bg-transparent text-sm text-app-text placeholder:text-app-text-sec"
            />
          </div>

          {/* Store tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scroll-area">
            {stores.map((store) => (
              <button
                key={store}
                type="button"
                onClick={() => setStoreFilter(store)}
                className={`pressable px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors border ${
                  storeFilter === store
                    ? 'bg-accent text-white border-accent'
                    : 'bg-app-card text-app-text-sec border-app-border'
                }`}
              >
                {store}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 scroll-area">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`pressable flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-medium whitespace-nowrap border transition-colors ${
                  catFilter === cat ? 'bg-accent/[0.09] text-accent border-accent/25' : 'bg-transparent text-app-text-sec border-transparent'
                }`}
              >
                <span>{cat === 'Всички' ? '🏷️' : categoryIcon(cat)}</span> {cat}
              </button>
            ))}
          </div>

          <div className="flex justify-end pb-1">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="rounded-lg border border-app-border bg-app-card px-2.5 py-1.5 text-xs text-app-text-sec focus:outline-none"
            >
              <option value="discount">По отстъпка</option>
              <option value="price">По цена</option>
            </select>
          </div>

          {/* Products grouped */}
          <div className="flex flex-col gap-1.5 pb-4">
            {grouped.map(([key, promos]) => (
              <div key={key}>
                <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-app-text-sec pt-3 pb-2">
                  {key}
                  <span className="text-[11px] font-semibold bg-black/[0.06] px-2 py-0.5 rounded-lg normal-case tracking-normal">
                    {promos.length}
                  </span>
                </div>
                {promos.map((promo) => {
                  const inList = listIds.has(promo.id)
                  const justAdded = justAddedIds.has(promo.id)
                  return (
                    <div key={promo.id} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-app-card border border-app-border mb-1.5">
                      <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 bg-accent/10">
                        <span className="text-[26px]">{categoryIcon(promo.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-app-text mb-0.5 truncate">{promo.product}</div>
                        <div className="text-xs text-app-text-sec">{promo.store} · {promo.category}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-app-text-sec line-through">{formatEUR(promo.regularPrice)}</span>
                          <span className="text-[15px] font-bold text-accent">{formatEUR(promo.promoPrice)}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg bg-accent/[0.18] text-accent">
                            -{discountPercent(promo)}%
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => !inList && addToList(promo)}
                        disabled={inList}
                        className={`pressable w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0 border-none transition-[transform,background-color] duration-200 ${
                          justAdded ? 'scale-[1.15]' : 'scale-100'
                        }`}
                        style={{ background: justAdded ? '#22C55E' : inList ? 'var(--color-app-border)' : 'var(--color-accent)' }}
                      >
                        {justAdded || !inList ? (
                          justAdded ? <IconCheck size={18} color="#fff" /> : <IconPlus size={18} color="#fff" />
                        ) : (
                          <IconCheck size={18} color="var(--color-app-text-sec)" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-app-text-sec text-sm">Няма намерени промоции</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
