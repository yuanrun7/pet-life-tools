import { assertPetStore } from './schema'
import type { PetStore } from './types'

export function exportBackup(store: PetStore): string {
  return JSON.stringify(store, null, 2)
}

export function parseBackup(json: string): PetStore {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid backup')
  }

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && Object.hasOwn(parsed, 'schemaVersion')) {
    if (Reflect.get(parsed, 'schemaVersion') !== 1) throw new Error('Unsupported backup version')
  }
  return assertPetStore(parsed)
}
