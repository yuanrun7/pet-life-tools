import { emptyStore, isPetStore } from './schema'
import type { PetStore, SaveResult } from './types'

export const STORE_KEY = 'pet-lifecycle-toolkit:records:v1'

export function loadStore(): PetStore {
  try {
    const raw = globalThis.localStorage?.getItem(STORE_KEY)
    if (!raw) return emptyStore()
    const parsed: unknown = JSON.parse(raw)
    return isPetStore(parsed) ? parsed : emptyStore()
  } catch {
    return emptyStore()
  }
}

export function saveStore(store: PetStore): SaveResult {
  try {
    const storage = globalThis.localStorage
    if (!storage) return { ok: false, error: 'unavailable' }
    storage.setItem(STORE_KEY, JSON.stringify(store))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof DOMException && error.name === 'QuotaExceededError' ? 'quota' : 'unavailable' }
  }
}
