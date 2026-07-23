import { describe, expect, it } from 'vitest'

import { exportBackup, parseBackup } from './backup'
import { emptyStore } from './schema'
import { resolvePetTarget } from './target'
import type { PetStore } from './types'

const validStore = (): PetStore => ({
  ...emptyStore(),
  pets: [{ id: 'pet-1', name: 'Momo', species: 'cat', birthday: '2024-01-01', notes: '' }],
  healthEvents: [{ id: 'health-1', petId: 'pet-1', kind: 'vaccine', date: '2026-07-22', title: 'Rabies', notes: '' }],
  expenses: [{ id: 'expense-1', petId: 'pet-1', date: '2026-07-22', title: 'Food', amount: 100, notes: '' }],
  reminders: [{ id: 'reminder-1', petId: 'pet-1', date: '2026-08-01', title: 'Checkup', notes: '' }],
})

describe('record backups', () => {
  it('round-trips a valid backup without changing its records', () => {
    const store = validStore()
    expect(parseBackup(exportBackup(store))).toEqual(store)
  })

  it('rejects an unsupported schema version', () => {
    expect(() => parseBackup(JSON.stringify({ ...validStore(), schemaVersion: 2 }))).toThrow('Unsupported backup version')
  })

  it('rejects backups with missing required fields', () => {
    expect(() => parseBackup(JSON.stringify({ schemaVersion: 1, pets: [] }))).toThrow('Invalid backup')
  })

  it('rejects records with invalid runtime shapes', () => {
    const invalid = validStore()
    invalid.expenses[0] = { ...invalid.expenses[0]!, amount: Number.NaN }
    expect(() => parseBackup(JSON.stringify(invalid))).toThrow('Invalid backup')
  })

  it('rejects impossible calendar dates in imported records', () => {
    const invalid = validStore()
    invalid.pets[0] = { ...invalid.pets[0]!, birthday: '2026-02-31' }
    expect(() => parseBackup(JSON.stringify(invalid))).toThrow('Invalid backup')
  })

  it('rejects records that reference a pet that is not in the backup', () => {
    const invalid = validStore()
    invalid.reminders[0] = { ...invalid.reminders[0]!, petId: 'missing-pet' }
    expect(() => parseBackup(JSON.stringify(invalid))).toThrow('Invalid backup')
  })

  it('resolves only an explicitly selected existing pet target', () => {
    const store = validStore()
    expect(resolvePetTarget(store, 'pet-1')).toEqual({ ok: true, pet: store.pets[0] })
    expect(resolvePetTarget(store, 'missing-pet')).toEqual({ ok: false, error: 'invalid-pet' })
  })
})
