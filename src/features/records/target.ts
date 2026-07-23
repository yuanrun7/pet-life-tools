import type { Pet, PetStore } from './types'

export type PetTargetResult = { ok: true; pet: Pet } | { ok: false; error: 'invalid-pet' }

export function resolvePetTarget(store: PetStore, petId: string): PetTargetResult {
  const pet = store.pets.find((item) => item.id === petId)
  return pet ? { ok: true, pet } : { ok: false, error: 'invalid-pet' }
}
