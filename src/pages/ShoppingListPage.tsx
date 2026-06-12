import { useEffect, useMemo, useState } from 'react'
import { useSyncedState } from '../lib/sync'
import type { Promotion, PurchaseRecord, ShoppingListItem } from '../lib/types'
import { formatEUR } from '../lib/format'
import { findMatchingPromotions, isPromotionActive, loadPromotions } from '../lib/promotions'
import { storeColor } from '../lib/catalogVisuals'
import { IconCart, IconCheck, IconChevronRight, IconMinus, IconPlus, IconTag, IconTrash } from '../lib/icons'
import Bezel from '../components/Bezel'
import Reveal from '../components/Reveal'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

const NO_STORE = 'Без магазин'

export default function ShoppingListPage() {
  const [items, setItems] = useSyncedState<ShoppingListItem[]>('shoppingList', [])
  const [, setPurchases] = useSyncedState<PurchaseRecord[]>('purchases', [])

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [estimatedPrice, setEstimatedPrice] = useState('')

  const [promotions, setPromotions] = useState<Promotion[]>([])
  useEffect(() => {
    let cancelled = false
    loadPromotions()
      .then((data) => {
        if (!cancelled) setPromotions(data)
      })
      .catch(() => {
        // Promo suggestions are a nice-to-have — silently skip if the catalog can't load.
      })
    return () => {
      cancelled = true
    }
  }, [])
  const activePromotions = useMemo(() => promotions.filter((promo) => isPromotionActive(promo)), [promotions])

  const estimatedTotal = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
  const purchasedItems = items.filter((item) => item.purchased)

  const byStore = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>()
    for (const item of items) {
      const key = item.store ?? NO_STORE
      const list = groups.get(key) ?? []
      list.push(item)
      groups.set(key, list)
    }
    return [...groups.entries()]
  }, [items])

  function addItem(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const qty = Number(quantity.replace(',', '.'))
    const price = Number(estimatedPrice.replace(',', '.'))
    if (!trimmedName || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) return

    setItems((prev) => [
      ...prev,
      { id: makeId(), name: trimmedName, quantity: qty, estimatedPrice: price, purchased: false },
    ])
    setName('')
    setQuantity('1')
    setEstimatedPrice('')
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function applyPromotion(id: string, promo: Promotion) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estimatedPrice: promo.promoPrice, store: promo.store, referencePrice: promo.regularPrice }
          : item,
      ),
    )
  }

  function togglePurchased(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              purchased: !item.purchased,
              actualPrice: !item.purchased ? item.actualPrice ?? item.estimatedPrice : item.actualPrice,
            }
          : item,
      ),
    )
  }

  function updateQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
    )
  }

  function setActualPrice(id: string, value: string) {
    const price = Number(value.replace(',', '.'))
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actualPrice: Number.isFinite(price) ? price : item.actualPrice } : item,
      ),
    )
  }

  function finishShopping() {
    if (purchasedItems.length === 0) return

    const recordItems = purchasedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      estimatedPrice: item.estimatedPrice,
      actualPrice: item.actualPrice ?? item.estimatedPrice,
      referencePrice: item.referencePrice,
    }))
    const total = recordItems.reduce((sum, item) => sum + item.actualPrice * item.quantity, 0)
    // Savings compare against the promo's regular price when linked, otherwise against the user's own estimate.
    const saved = recordItems.reduce(
      (sum, item) => sum + Math.max(0, (item.referencePrice ?? item.estimatedPrice) - item.actualPrice) * item.quantity,
      0,
    )

    const record: PurchaseRecord = {
      id: makeId(),
      date: new Date().toISOString(),
      items: recordItems,
      total,
      saved,
    }

    setPurchases((prev) => [record, ...prev])
    setItems((prev) => prev.filter((item) => !item.purchased))
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between py-2">
        <h1 className="text-[22px] font-display font-bold text-app-text tracking-tight m-0">Списък</h1>
        {items.length > 0 && (
          <span className="text-sm font-bold text-accent">{purchasedItems.length}/{items.length}</span>
        )}
      </div>

      <p className="text-sm text-app-text-sec -mt-1 mb-3">
        Добавете продукти с очаквана цена. Когато ги купите, отбележете ги и въведете реалната цена.
      </p>

      <Bezel variant="full" className="bg-app-card">
        <form onSubmit={addItem} className="p-4 grid grid-cols-12 gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Продукт, напр. Мляко"
            className="col-span-12 sm:col-span-6 rounded-xl bg-app-bg px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            type="text"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Бр./кг"
            className="col-span-6 sm:col-span-2 rounded-xl bg-app-bg px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            type="text"
            inputMode="decimal"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            placeholder="Очаквана цена (€)"
            className="col-span-6 sm:col-span-2 rounded-xl bg-app-bg px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            className="pressable col-span-12 sm:col-span-2 rounded-xl bg-accent text-white text-sm font-semibold py-2 hover:bg-accent-dark transition-colors"
          >
            Добави
          </button>
        </form>
      </Bezel>

      {items.length > 0 && (
        <>
          {/* Summary strip */}
          <Reveal className="mt-3.5">
            <Bezel variant="full" className="bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-between px-5 py-[18px]">
              <div>
                <div className="text-xs opacity-80">Обща сума</div>
                <div className="text-2xl font-display font-extrabold tracking-tight tabular-nums">{formatEUR(estimatedTotal)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80">Продукти</div>
                <div className="text-2xl font-display font-extrabold tracking-tight tabular-nums">{totalQty}</div>
              </div>
            </Bezel>
          </Reveal>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-app-border overflow-hidden mt-3 mb-2">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${items.length > 0 ? (purchasedItems.length / items.length) * 100 : 0}%` }}
            />
          </div>
        </>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 px-5">
          <IconCart size={48} color="var(--color-app-text-sec)" />
          <div className="text-lg font-display font-bold text-app-text mt-3 mb-1.5">Списъкът е празен</div>
          <div className="text-sm text-app-text-sec">Добавете първия продукт по-горе или от раздел Промоции</div>
        </div>
      ) : (
        byStore.map(([store, storeItems]) => (
          <div key={store} className="mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-app-text-sec pt-3 pb-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: store === NO_STORE ? 'var(--color-accent)' : storeColor(store) }} />
              {store}
            </div>
            {storeItems.map((item) => {
              const suggestion = !item.store && !item.purchased ? findMatchingPromotions(item.name, activePromotions)[0] : undefined
              return (
                <div key={item.id} className="mb-1.5">
                  <Bezel variant="flat" className="bg-app-card flex items-center gap-2.5 px-3 py-3 transition-opacity">
                    <div style={{ opacity: item.purchased ? 0.55 : 1 }} className="flex items-center gap-2.5 w-full">
                      <button
                        type="button"
                        onClick={() => togglePurchased(item.id)}
                        className="pressable w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: item.purchased ? 'var(--color-accent)' : 'transparent',
                          borderColor: item.purchased ? 'var(--color-accent)' : 'var(--color-app-text-sec)50',
                        }}
                      >
                        {item.purchased && <IconCheck size={14} color="#fff" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold text-app-text ${item.purchased ? 'line-through' : ''}`}>
                          {item.name}
                        </div>
                        <div className="text-xs font-semibold text-accent mt-0.5 tabular-nums">
                          {formatEUR(item.estimatedPrice)} × {item.quantity} = {formatEUR(item.quantity * item.estimatedPrice)}
                        </div>
                      </div>

                      {item.purchased ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="text-xs text-app-text-sec">Платено:</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            defaultValue={(item.actualPrice ?? item.estimatedPrice).toString()}
                            onChange={(e) => setActualPrice(item.id, e.target.value)}
                            className="w-16 rounded-lg bg-app-bg px-2 py-1 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                          />
                          <span className="text-xs text-app-text-sec">€</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            className="pressable w-7 h-7 rounded-lg bg-app-bg flex items-center justify-center text-accent"
                          >
                            <IconMinus size={14} />
                          </button>
                          <span className="text-sm font-bold text-app-text min-w-[18px] text-center tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            className="pressable w-7 h-7 rounded-lg bg-app-bg flex items-center justify-center text-accent"
                          >
                            <IconPlus size={14} />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="pressable w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
                        aria-label="Премахни"
                      >
                        <IconTrash size={16} color="#EF4444" />
                      </button>
                    </div>
                  </Bezel>

                  {suggestion && (
                    <div className="ml-8 mt-1.5 flex flex-wrap items-center gap-2 text-xs bg-accent/10 rounded-xl px-3 py-2">
                      <span className="text-accent flex items-center gap-1.5">
                        <IconTag size={14} color="var(--color-accent)" />
                        В промоция в <strong>{suggestion.store}</strong>: {suggestion.product} за{' '}
                        <strong>{formatEUR(suggestion.promoPrice)}</strong> (вместо {formatEUR(suggestion.regularPrice)})
                      </span>
                      <button
                        type="button"
                        onClick={() => applyPromotion(item.id, suggestion)}
                        className="pressable rounded-full bg-accent text-white font-semibold px-2.5 py-1 hover:bg-accent-dark transition-colors"
                      >
                        Приложи цената
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))
      )}

      {items.length > 0 && (
        <Bezel variant="full" className="bg-app-card flex flex-wrap items-center justify-between gap-3 p-4 mt-3">
          <div>
            <p className="text-sm text-app-text-sec">Очаквана обща сума</p>
            <p className="text-lg font-display font-bold text-app-text tabular-nums">{formatEUR(estimatedTotal)}</p>
          </div>
          <button
            type="button"
            onClick={finishShopping}
            disabled={purchasedItems.length === 0}
            className="magnetic pressable flex items-center gap-3 rounded-full bg-accent text-white text-sm font-semibold pl-5 pr-1.5 py-1.5 hover:bg-accent-dark transition-colors disabled:bg-app-border disabled:text-app-text-sec disabled:cursor-not-allowed"
          >
            Приключи пазаруването ({purchasedItems.length})
            <span className="magnetic-icon w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <IconChevronRight size={16} color="currentColor" />
            </span>
          </button>
        </Bezel>
      )}
    </div>
  )
}
