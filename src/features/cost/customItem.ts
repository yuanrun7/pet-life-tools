import type { CostItem } from './types'

export type UuidSource = Pick<Crypto, 'randomUUID'> | null

let fallbackSequence = 0

export function createCostItemId(source: UuidSource = globalThis.crypto) {
  if (source && typeof source.randomUUID === 'function') {
    return source.randomUUID()
  }

  fallbackSequence += 1
  return `custom-${fallbackSequence}`
}

export function createCustomCostItem(source?: UuidSource): CostItem {
  return {
    id: source === undefined ? createCostItemId() : createCostItemId(source),
    label: '自定义项目',
    amount: 0,
    cadence: 'annual',
    necessity: 'optional',
  }
}
