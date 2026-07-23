import { describe, expect, it } from 'vitest'

import { formatCurrency } from './CostBreakdown'
import { createCustomCostItem } from './customItem'

describe('formatCurrency', () => {
  it('preserves cents instead of rounding a ¥0.50 amount to whole yuan', () => {
    expect(formatCurrency(0.5)).toBe('¥0.50')
  })
})

describe('createCustomCostItem', () => {
  it('uses an injectable UUID source and has a collision-free fallback for rapid additions', () => {
    const injected = createCustomCostItem({ randomUUID: () => '00000000-0000-4000-8000-000000000000' })
    const firstFallback = createCustomCostItem(null)
    const secondFallback = createCustomCostItem(null)

    expect(injected.id).toBe('00000000-0000-4000-8000-000000000000')
    expect(firstFallback.id).not.toBe(secondFallback.id)
  })
})
