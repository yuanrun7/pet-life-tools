import { describe, expect, it } from 'vitest'

import { calculateCost } from './calculateCost'
import { getCostTemplate } from './defaults'
import type { CostInput } from './types'

function input(overrides: Partial<CostInput> = {}): CostInput {
  return {
    lifespanYears: 10,
    items: [
      { id: 'carrier', label: 'Carrier', amount: 100, cadence: 'upfront', necessity: 'essential' },
      { id: 'food', label: 'Food', amount: 200, cadence: 'monthly', necessity: 'essential' },
      { id: 'checkup', label: 'Checkup', amount: 300, cadence: 'annual', necessity: 'essential' },
      { id: 'reserve', label: 'Medical reserve', amount: 500, cadence: 'reserve', necessity: 'essential' },
    ],
    ...overrides,
  }
}

describe('calculateCost', () => {
  it('provides independent editable example templates for cats and dogs', () => {
    const cat = getCostTemplate('cat')
    const dog = getCostTemplate('dog')
    cat.items[0].amount = 0

    expect(cat).toMatchObject({ species: 'cat', isExample: true })
    expect(dog).toMatchObject({ species: 'dog', isExample: true })
    expect(dog.items[0].amount).toBeGreaterThan(0)
    expect(cat.items.some((item) => item.necessity === 'essential')).toBe(true)
    expect(cat.items.some((item) => item.necessity === 'optional')).toBe(true)
  })

  it('keeps zero-valued inputs and totals at zero', () => {
    const summary = calculateCost(input({
      lifespanYears: 0,
      items: [{ id: 'free', label: 'Free', amount: 0, cadence: 'monthly', necessity: 'optional' }],
    }))

    expect(summary).toMatchObject({ upfront: 0, monthly: 0, annual: 0, reserve: 0, firstYear: 0, lifetime: 0 })
    expect(summary.categories.optional.monthly).toBe(0)
    expect(summary.details).toEqual([expect.objectContaining({ id: 'free', amount: 0, necessity: 'optional' })])
  })

  it.each([
    ['negative lifespan', input({ lifespanYears: -1 })],
    ['negative item amount', input({ items: [{ id: 'bad', label: 'Bad', amount: -1, cadence: 'annual', necessity: 'essential' }] })],
    ['NaN lifespan', input({ lifespanYears: Number.NaN })],
    ['infinite item amount', input({ items: [{ id: 'bad', label: 'Bad', amount: Number.POSITIVE_INFINITY, cadence: 'annual', necessity: 'essential' }] })],
  ])('rejects %s', (_label, invalidInput) => {
    expect(() => calculateCost(invalidInput)).toThrow(/finite non-negative/i)
  })

  it('calculates one-time, monthly, annual, and reserve costs across the first year and lifetime', () => {
    const summary = calculateCost(input())

    expect(summary).toMatchObject({
      upfront: 100,
      monthly: 200,
      annual: 300,
      reserve: 500,
      firstYear: 3300,
      lifetime: 32100,
    })
  })

  it('includes edited custom amounts in the appropriate necessity breakdown', () => {
    const summary = calculateCost(input({
      lifespanYears: 2,
      items: [
        { id: 'custom-toy', label: 'Custom toy budget', amount: 50, cadence: 'monthly', necessity: 'optional' },
        { id: 'custom-training', label: 'Custom training', amount: 120, cadence: 'annual', necessity: 'optional' },
      ],
    }))

    expect(summary.categories.optional).toMatchObject({ monthly: 50, annual: 120, firstYear: 720, lifetime: 1440 })
    expect(summary.details.map((item) => item.label)).toEqual(['Custom toy budget', 'Custom training'])
  })
})
