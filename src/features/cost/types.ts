export type CostCadence = 'upfront' | 'monthly' | 'annual' | 'reserve'
export type CostNecessity = 'essential' | 'optional'

export interface CostItem {
  id: string
  label: string
  amount: number
  cadence: CostCadence
  necessity: CostNecessity
}

export interface CostInput {
  lifespanYears: number
  items: ReadonlyArray<CostItem>
}

export interface CostTotals {
  upfront: number
  monthly: number
  annual: number
  reserve: number
  firstYear: number
  lifetime: number
}

export interface CostDetail extends CostItem {
  firstYear: number
  lifetime: number
}

export interface CostSummary extends CostTotals {
  categories: Record<CostNecessity, CostTotals>
  details: CostDetail[]
}
