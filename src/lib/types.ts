export type BudgetPeriod = 'weekly' | 'monthly'

export interface Budget {
  amount: number
  period: BudgetPeriod
  startDate: string // ISO date (yyyy-mm-dd) — anchor for period calculation
}

// amount: 0 means "not configured yet"
export const DEFAULT_BUDGET: Budget = {
  amount: 0,
  period: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
}

export interface Promotion {
  id: string
  store: string
  product: string
  category: string
  regularPrice: number
  promoPrice: number
  validFrom: string // ISO date
  validTo: string // ISO date
}

export interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  estimatedPrice: number // planned price per unit, EUR
  purchased: boolean
  actualPrice?: number // price per unit actually paid, filled in on purchase
  store?: string // set when linked to a promotion
  referencePrice?: number // promo's regular (non-discounted) price — used to compute true savings
}

export interface PurchaseRecord {
  id: string
  date: string // ISO date
  items: {
    name: string
    quantity: number
    estimatedPrice: number
    actualPrice: number
    referencePrice?: number
  }[]
  total: number
  saved: number
}
