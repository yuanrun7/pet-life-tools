export type PetSpecies = 'cat' | 'dog'

export interface Pet {
  id: string
  name: string
  species: PetSpecies
  birthday: string
  notes: string
}

export interface HealthEvent {
  id: string
  petId: string
  kind: string
  date: string
  title: string
  notes: string
}

export interface ExpenseRecord {
  id: string
  petId: string
  date: string
  title: string
  amount: number
  notes: string
}

export interface Reminder {
  id: string
  petId: string
  date: string
  title: string
  notes: string
  completed?: boolean
}

export interface PetStore {
  schemaVersion: 1
  pets: Pet[]
  healthEvents: HealthEvent[]
  expenses: ExpenseRecord[]
  reminders: Reminder[]
}

export type SaveResult = { ok: true } | { ok: false; error: 'quota' | 'unavailable' }
