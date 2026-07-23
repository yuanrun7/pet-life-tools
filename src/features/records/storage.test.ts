import { afterEach, describe, expect, it, vi } from 'vitest'

import { emptyStore } from './schema'
import { loadStore, saveStore, STORE_KEY } from './storage'
import type { PetStore } from './types'

const storeWithPet = (): PetStore => ({
  ...emptyStore(),
  pets: [{ id: 'pet-1', name: 'Momo', species: 'cat', birthday: '2024-01-01', notes: '' }],
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('local pet records storage', () => {
  it('saves, loads, and updates pet records through one namespaced key', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) }
    vi.stubGlobal('localStorage', storage)

    expect(saveStore(storeWithPet())).toEqual({ ok: true })
    expect([...values.keys()]).toEqual([STORE_KEY])
    expect(loadStore().pets[0]?.name).toBe('Momo')

    const updated = loadStore()
    updated.pets[0] = { ...updated.pets[0]!, name: 'Mochi' }
    expect(saveStore(updated)).toEqual({ ok: true })
    expect(loadStore().pets[0]?.name).toBe('Mochi')

    expect(saveStore({ ...updated, pets: [] })).toEqual({ ok: true })
    expect(loadStore().pets).toEqual([])
  })

  it('falls back to an empty store when localStorage cannot be read or contains invalid data', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked') }, setItem: () => undefined })
    expect(loadStore()).toEqual(emptyStore())

    vi.stubGlobal('localStorage', { getItem: () => '{bad json', setItem: () => undefined })
    expect(loadStore()).toEqual(emptyStore())
  })

  it('returns a failed result instead of throwing when browser quota is exceeded', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError')
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw quotaError } })

    expect(saveStore(storeWithPet())).toEqual({ ok: false, error: 'quota' })
  })
})
