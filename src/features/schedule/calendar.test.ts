import { expect, it } from 'vitest'

import { createCalendar } from './calendar'

it('exports all-day .ics dates in YYYYMMDD format', () => {
  const calendar = createCalendar([
    {
      id: 'cat-vaccine-20260722',
      category: 'vaccine',
      label: '幼猫基础疫苗复核建议',
      startDate: '2026-07-22',
      endDate: '2026-07-28',
      requiresVetConfirmation: true,
    },
  ])

  expect(calendar).toContain('BEGIN:VCALENDAR\r\n')
  expect(calendar).toContain('DTSTART;VALUE=DATE:20260722\r\n')
  expect(calendar).toContain('DTEND;VALUE=DATE:20260723\r\n')
  expect(calendar).toContain('SUMMARY:幼猫基础疫苗复核建议\r\n')
})
