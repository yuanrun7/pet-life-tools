import type { ScheduleEvent } from './types'

function addOneDay(date: string) {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

function calendarDate(date: string) {
  return date.replaceAll('-', '')
}

function escapeIcs(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n')
}

export function createCalendar(events: ScheduleEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pet Lifecycle Toolkit//Care Schedule//ZH']

  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@pet-lifecycle-toolkit.local`,
      `DTSTART;VALUE=DATE:${calendarDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${calendarDate(addOneDay(event.startDate))}`,
      `SUMMARY:${escapeIcs(event.label)}`,
      'DESCRIPTION:仅为建议时间窗口，须由执业兽医确认。',
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}
