import type { Budget, PurchaseRecord } from './types'

export interface PeriodRange {
  start: Date
  end: Date // exclusive
}

/** Returns the [start, end) range of the budget period that contains `today`. */
export function getCurrentPeriod(budget: Budget, today = new Date()): PeriodRange {
  const anchor = new Date(budget.startDate)
  anchor.setHours(0, 0, 0, 0)

  if (budget.period === 'weekly') {
    const msInWeek = 7 * 24 * 60 * 60 * 1000
    const elapsed = today.getTime() - anchor.getTime()
    const weeksElapsed = Math.floor(elapsed / msInWeek)
    const start = new Date(anchor.getTime() + weeksElapsed * msInWeek)
    const end = new Date(start.getTime() + msInWeek)
    return { start, end }
  }

  // monthly: walk month-by-month from the anchor until we bracket `today`
  let start = new Date(anchor)
  let end = addMonths(start, 1)
  while (end <= today) {
    start = end
    end = addMonths(start, 1)
  }
  while (start > today) {
    end = start
    start = addMonths(start, -1)
  }
  return { start, end }
}

function addMonths(date: Date, count: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + count)
  return result
}

export function isWithinPeriod(dateIso: string, period: PeriodRange): boolean {
  const date = new Date(dateIso)
  return date >= period.start && date < period.end
}

export function purchasesInPeriod(purchases: PurchaseRecord[], period: PeriodRange): PurchaseRecord[] {
  return purchases.filter((purchase) => isWithinPeriod(purchase.date, period))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
}
