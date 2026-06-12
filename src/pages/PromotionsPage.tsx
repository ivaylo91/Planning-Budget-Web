import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useSyncedState } from '../lib/sync'
import { discountPercent, findMatchingPromotions, isPromotionActive, loadPromotions } from '../lib/promotions'
import type { Promotion, ShoppingListItem } from '../lib/types'
import { formatEUR } from '../lib/format'
import { notifyOnce } from '../lib/notifications'
import { categoryIcon, storeColor } from '../lib/catalogVisuals'
import { IconCheck, IconFlame, IconPlus, IconSearch } from '../lib/icons'
import Bezel from '../components/Bezel'
import Reveal from '../components/Reveal'

const STORE_ORDER = ['Billa', 'Lidl', 'Kaufland', 'Fantastiko', 'T Market', 'Metro', 'CBA']
const TOP = 'Топ'

type SortMode = 'discount' | 'price'

type Row =
  | { type: 'header'; key: string; label: string; count: number }
  | { type: 'promo'; promo: Promotion }

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState<string>('Всички')
  const [catFilter, setCatFilter] = useState<string>('Всички')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('discount')
  const [justAddedIds, setJustAddedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })
  const [listVisible, setListVisible] = useState(false)

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

  // Fade the list in once the catalog has loaded.
  useEffect(() => {
    if (!promotions) return
    const frame = requestAnimationFrame(() => setListVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [promotions])

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
  }, [promotions, items])

  const stores = useMemo(() => {
    if (!promotions) return []
    const present = new Set(promotions.map((p) => p.store))
    return [TOP, 'Всички', ...STORE_ORDER.filter((store) => present.has(store))]
  }, [promotions])

  const categories = useMemo(() => {
    if (!promotions) return []
    return ['Всички', ...Array.from(new Set(promotions.map((p) => p.category))).sort()]
  }, [promotions])

  const isTop = storeFilter === TOP

  const filtered = useMemo(() => {
    if (!promotions) return []
    const query = search.trim().toLowerCase()
    const effectiveSort: SortMode = isTop ? 'discount' : sortMode
    return promotions
      .filter((promo) => isTop || storeFilter === 'Всички' || promo.store === storeFilter)
      .filter((promo) => catFilter === 'Всички' || promo.category === catFilter)
      .filter((promo) => !query || promo.product.toLowerCase().includes(query))
      .sort((a, b) =>
        effectiveSort === 'discount'
          ? discountPercent(b) - discountPercent(a)
          : a.promoPrice - b.promoPrice,
      )
  }, [promotions, storeFilter, catFilter, search, sortMode, isTop])

  const rows = useMemo<Row[]>(() => {
    if (isTop) {
      return filtered.map((promo) => ({ type: 'promo', promo }))
    }
    const groups = new Map<string, Promotion[]>()
    for (const promo of filtered) {
      const key = storeFilter === 'Всички' ? promo.store : promo.category
      const list = groups.get(key) ?? []
      list.push(promo)
      groups.set(key, list)
    }
    const result: Row[] = []
    for (const [key, promos] of groups) {
      result.push({ type: 'header', key, label: key, count: promos.length })
      for (const promo of promos) result.push({ type: 'promo', promo })
    }
    return result
  }, [filtered, storeFilter, isTop])

  const listIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    setScrollMargin(listRef.current?.offsetTop ?? 0)
  }, [storeFilter, catFilter])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => (rows[index]?.type === 'header' ? 40 : 84),
    overscan: 6,
    scrollMargin,
    getItemKey: (index) => {
      const row = rows[index]
      return row?.type === 'header' ? `header-${row.key}` : row?.promo.id ?? index
    },
  })

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
          className={`absolute -top-1 left-0 right-0 z-20 flex items-center gap-2 rounded-2xl bg-accent text-white px-4 py-3 text-[13px] font-semibold shadow-diffused-lg transition-[opacity,transform] duration-300 ease-out ${
            toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          <IconCheck size={16} color="#fff" />
          {toast.message}
        </div>
      )}

      <div className="flex items-baseline justify-between py-2">
        <h1 className="text-[22px] font-display font-bold text-app-text tracking-tight m-0">Промоции</h1>
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
          {/* Search + filters */}
          <Reveal>
            <Bezel variant="full" className="bg-app-card flex items-center gap-2.5 px-3.5 py-2.5 mb-3">
              <IconSearch size={18} color="var(--color-app-text-sec)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търси продукт..."
                className="flex-1 border-none outline-none bg-transparent text-sm text-app-text placeholder:text-app-text-sec"
              />
            </Bezel>

            {/* Store tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 scroll-area">
              {stores.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => setStoreFilter(store)}
                  className={`pressable px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shadow-diffused ${
                    storeFilter === store ? 'bg-accent text-white' : 'bg-app-card text-app-text-sec'
                  }`}
                >
                  {store === TOP ? (
                    <span className="inline-flex items-center gap-1.5">
                      <IconFlame size={14} color={storeFilter === TOP ? '#fff' : 'var(--color-accent)'} />
                      {TOP}
                    </span>
                  ) : (
                    store
                  )}
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
                  className={`pressable flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    catFilter === cat ? 'bg-accent/10 text-accent' : 'bg-transparent text-app-text-sec'
                  }`}
                >
                  {cat !== 'Всички' && <span>{categoryIcon(cat)}</span>} {cat}
                </button>
              ))}
            </div>

            {!isTop && (
              <div className="flex justify-end pb-1">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="rounded-full bg-app-card shadow-diffused px-3 py-1.5 text-xs text-app-text-sec focus:outline-none"
                >
                  <option value="discount">По отстъпка</option>
                  <option value="price">По цена</option>
                </select>
              </div>
            )}
          </Reveal>

          {/* Products — virtualized list */}
          <div ref={listRef} className={`list-fade ${listVisible ? 'list-fade-visible' : ''}`}>
            {rows.length === 0 ? (
              <div className="text-center py-10 text-app-text-sec text-sm">Няма намерени промоции</div>
            ) : (
              <div style={{ position: 'relative', height: virtualizer.getTotalSize() }} className="pb-4">
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const row = rows[virtualItem.index]
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
                      }}
                    >
                      {row.type === 'header' ? (
                        <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-app-text-sec pt-3 pb-2">
                          {row.label}
                          <span className="text-[11px] font-semibold bg-app-border px-2 py-0.5 rounded-lg normal-case tracking-normal">
                            {row.count}
                          </span>
                        </div>
                      ) : (
                        <div className="pb-1.5">
                          <PromoRow
                            promo={row.promo}
                            showStoreBadge={isTop}
                            inList={listIds.has(row.promo.id)}
                            justAdded={justAddedIds.has(row.promo.id)}
                            onAdd={() => addToList(row.promo)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

interface PromoRowProps {
  promo: Promotion
  showStoreBadge: boolean
  inList: boolean
  justAdded: boolean
  onAdd: () => void
}

function PromoRow({ promo, showStoreBadge, inList, justAdded, onAdd }: PromoRowProps) {
  return (
    <Bezel variant="flat" className="bg-app-card flex items-center gap-3 px-3.5 py-3">
      <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 bg-accent/10">
        <span className="text-[26px]">{categoryIcon(promo.category)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-app-text mb-0.5 truncate">{promo.product}</div>
        <div className="text-xs text-app-text-sec flex items-center gap-1.5">
          {showStoreBadge && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: storeColor(promo.store) }} />
          )}
          {promo.store} · {promo.category}
        </div>
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
        onClick={() => !inList && onAdd()}
        disabled={inList}
        className={`magnetic pressable w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border-none transition-[transform,background-color] duration-200 ${
          justAdded ? 'scale-[1.15]' : 'scale-100'
        }`}
        style={{ background: justAdded ? '#22C55E' : inList ? 'var(--color-app-border)' : 'var(--color-accent)' }}
      >
        <span className="magnetic-icon flex items-center justify-center">
          {justAdded || !inList ? (
            justAdded ? <IconCheck size={18} color="#fff" /> : <IconPlus size={18} color="#fff" />
          ) : (
            <IconCheck size={18} color="var(--color-app-text-sec)" />
          )}
        </span>
      </button>
    </Bezel>
  )
}
