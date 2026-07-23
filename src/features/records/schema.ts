import type { ExpenseRecord, HealthEvent, Pet, PetStore, Reminder } from './types'

export function emptyStore(): PetStore {
  return { schemaVersion: 1, pets: [], healthEvents: [], expenses: [], reminders: [] }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isText = (value: unknown): value is string => typeof value === 'string'
export function isRealIsoDate(value: unknown): value is string {
  if (!isText(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function isPet(value: unknown): value is Pet {
  return isRecord(value) && isText(value.id) && isText(value.name) && (value.species === 'cat' || value.species === 'dog') && isRealIsoDate(value.birthday) && isText(value.notes)
}

function isHealthEvent(value: unknown): value is HealthEvent {
  return isRecord(value) && isText(value.id) && isText(value.petId) && isText(value.kind) && isRealIsoDate(value.date) && isText(value.title) && isText(value.notes)
}

function isExpense(value: unknown): value is ExpenseRecord {
  return isRecord(value) && isText(value.id) && isText(value.petId) && isRealIsoDate(value.date) && isText(value.title) && typeof value.amount === 'number' && Number.isFinite(value.amount) && isText(value.notes)
}

function isReminder(value: unknown): value is Reminder {
  return isRecord(value) && isText(value.id) && isText(value.petId) && isRealIsoDate(value.date) && isText(value.title) && isText(value.notes) && (!('completed' in value) || typeof value.completed === 'boolean')
}

export function isPetStore(value: unknown): value is PetStore {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.pets) || !value.pets.every(isPet) || !Array.isArray(value.healthEvents) || !value.healthEvents.every(isHealthEvent) || !Array.isArray(value.expenses) || !value.expenses.every(isExpense) || !Array.isArray(value.reminders) || !value.reminders.every(isReminder)) return false
  const petIds = new Set(value.pets.map((pet) => pet.id))
  return value.healthEvents.every((event) => petIds.has(event.petId)) && value.expenses.every((expense) => petIds.has(expense.petId)) && value.reminders.every((reminder) => petIds.has(reminder.petId))
}

export function assertPetStore(value: unknown): PetStore {
  if (!isPetStore(value)) throw new Error('Invalid backup')
  return value
}
