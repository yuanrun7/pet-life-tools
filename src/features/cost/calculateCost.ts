import type { CostDetail, CostInput, CostItem, CostNecessity, CostSummary, CostTotals } from './types'

function emptyTotals(): CostTotals {
  return { upfront: 0, monthly: 0, annual: 0, reserve: 0, firstYear: 0, lifetime: 0 }
}

function assertFiniteNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite non-negative number`)
  }
}

function itemTotals(item: CostItem, lifespanYears: number): Pick<CostDetail, 'firstYear' | 'lifetime'> {
  const firstYear = item.cadence === 'monthly' ? item.amount * 12 : item.amount
  const lifetime = item.cadence === 'upfront' ? item.amount : firstYear * lifespanYears

  return { firstYear, lifetime }
}

function addItem(target: CostTotals, item: CostItem, detail: Pick<CostDetail, 'firstYear' | 'lifetime'>) {
  target[item.cadence] += item.amount
  target.firstYear += detail.firstYear
  target.lifetime += detail.lifetime
}

export function calculateCost(input: CostInput): CostSummary {
  assertFiniteNonNegative(input.lifespanYears, 'lifespanYears')

  const categories: Record<CostNecessity, CostTotals> = {
    essential: emptyTotals(),
    optional: emptyTotals(),
  }
  const summary = emptyTotals()
  const details = input.items.map((item) => {
    assertFiniteNonNegative(item.amount, `amount for ${item.id}`)
    const detail = { ...item, ...itemTotals(item, input.lifespanYears) }
    addItem(summary, item, detail)
    addItem(categories[item.necessity], item, detail)
    return detail
  })

  return { ...summary, categories, details }
}
