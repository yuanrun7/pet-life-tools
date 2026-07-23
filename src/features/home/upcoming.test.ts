import { describe, expect, it } from 'vitest'

import { getUpcoming } from './upcoming'
import type { PetStore } from '../records/types'

const store = (reminders: PetStore['reminders']): PetStore => ({
  schemaVersion: 1,
  pets: [],
  healthEvents: [],
  expenses: [],
  reminders,
})

describe('getUpcoming', () => {
  it('returns incomplete future reminders in stable date order without changing the source array', () => {
    const reminders = [
      { id: 'later', petId: 'pet', date: '2026-07-25', title: 'Later', notes: '' },
      { id: 'today-second', petId: 'pet', date: '2026-07-23', title: 'Today second', notes: '' },
      { id: 'past', petId: 'pet', date: '2026-07-22', title: 'Past', notes: '' },
      { id: 'today-first', petId: 'pet', date: '2026-07-23', title: 'Today first', notes: '' },
    ]

    const result = getUpcoming(store(reminders), new Date('2026-07-23T23:59:59'), 3)

    expect(result.map((reminder) => reminder.id)).toEqual(['today-second', 'today-first', 'later'])
    expect(reminders.map((reminder) => reminder.id)).toEqual(['later', 'today-second', 'past', 'today-first'])
  })

  it('returns no reminders for a non-positive or non-finite limit', () => {
    const value = store([{ id: 'future', petId: 'pet', date: '2026-07-24', title: 'Future', notes: '' }])

    expect(getUpcoming(value, new Date('2026-07-23T12:00:00'), 0)).toEqual([])
    expect(getUpcoming(value, new Date('2026-07-23T12:00:00'), Number.NaN)).toEqual([])
  })

  it('excludes reminders that have been completed', () => {
    const value = store([
      { id: 'complete', petId: 'pet', date: '2026-07-24', title: 'Complete', notes: '', completed: true },
      { id: 'open', petId: 'pet', date: '2026-07-24', title: 'Open', notes: '' },
    ])

    expect(getUpcoming(value, new Date('2026-07-23T12:00:00'), 2).map((reminder) => reminder.id)).toEqual(['open'])
  })
})
