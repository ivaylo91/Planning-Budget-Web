import { parseCsvRecords } from './csv'
import type { Promotion } from './types'

const CATALOG_URL = '/data/promotions.csv'

export async function loadPromotions(): Promise<Promotion[]> {
  const response = await fetch(CATALOG_URL)
  if (!response.ok) throw new Error(`Неуспешно зареждане на каталога (${response.status})`)
  const text = await response.text()
  return parseCsvRecords(text)
    .map(recordToPromotion)
    .filter((promo): promo is Promotion => promo !== null)
}

function recordToPromotion(record: Record<string, string>): Promotion | null {
  const regularPrice = Number(record.regularPrice)
  const promoPrice = Number(record.promoPrice)
  if (!record.product || !Number.isFinite(regularPrice) || !Number.isFinite(promoPrice)) return null

  return {
    id: `${record.store}-${record.product}-${record.validFrom}`.toLowerCase().replace(/\s+/g, '-'),
    store: record.store,
    product: record.product,
    category: record.category || 'Други',
    regularPrice,
    promoPrice,
    validFrom: record.validFrom,
    validTo: record.validTo,
  }
}

export function discountPercent(promo: Promotion): number {
  if (promo.regularPrice <= 0) return 0
  return Math.round((1 - promo.promoPrice / promo.regularPrice) * 100)
}

export function isPromotionActive(promo: Promotion, today = new Date()): boolean {
  const from = new Date(promo.validFrom)
  const to = new Date(promo.validTo)
  to.setHours(23, 59, 59, 999)
  return from <= today && today <= to
}

/** Finds active promotions whose product name overlaps with a (possibly partial) shopping-list item name. */
export function findMatchingPromotions(itemName: string, activePromotions: Promotion[]): Promotion[] {
  const query = itemName.trim().toLowerCase()
  if (query.length < 2) return []
  return activePromotions
    .filter((promo) => {
      const product = promo.product.toLowerCase()
      return product.includes(query) || query.includes(product)
    })
    .sort((a, b) => discountPercent(b) - discountPercent(a))
}
