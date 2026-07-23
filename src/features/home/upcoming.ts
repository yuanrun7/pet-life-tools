import type { PetStore, Reminder } from '../records/types'

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getUpcoming(store: PetStore, now: Date, limit: number): Reminder[] {
  if (!Number.isFinite(limit) || limit <= 0) return []

  const today = localDateKey(now)
  return store.reminders
    .map((reminder, index) => ({ reminder, index }))
    .filter(({ reminder }) => !reminder.completed && reminder.date >= today)
    .sort((left, right) => left.reminder.date.localeCompare(right.reminder.date) || left.index - right.index)
    .slice(0, Math.floor(limit))
    .map(({ reminder }) => reminder)
}
