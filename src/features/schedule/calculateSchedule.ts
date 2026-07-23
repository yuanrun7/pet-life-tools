import { adultPetLabels, ruleMetadata, youngPetRules } from './rules'
import type { ScheduleEvent, ScheduleInput, ScheduleResult } from './types'

const dayInMilliseconds = 24 * 60 * 60 * 1000
const youngPetDays = 16 * 7

export function isRealIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  if (year < 1) return false
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function utcDate(value: string) {
  return new Date(`${value}T00:00:00Z`)
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: string, days: number) {
  return toIsoDate(new Date(utcDate(date).getTime() + days * dayInMilliseconds))
}

function nextBirthday(birthday: string, today: string) {
  const birthdayDate = utcDate(birthday)
  const todayDate = utcDate(today)
  let anniversary = new Date(Date.UTC(todayDate.getUTCFullYear(), birthdayDate.getUTCMonth(), birthdayDate.getUTCDate()))

  if (anniversary.getTime() <= todayDate.getTime()) {
    anniversary = new Date(Date.UTC(todayDate.getUTCFullYear() + 1, birthdayDate.getUTCMonth(), birthdayDate.getUTCDate()))
  }

  return toIsoDate(anniversary)
}

function baseResult(): Pick<ScheduleResult, 'ruleVersion' | 'reviewedAt' | 'scope'> {
  return ruleMetadata
}

function result(events: ScheduleEvent[], warnings: string[]): ScheduleResult {
  return { ...baseResult(), events, warnings }
}

export function calculateSchedule(input: ScheduleInput): ScheduleResult {
  const today = input.now ?? toIsoDate(new Date())

  if (!isRealIsoDate(input.birthday) || !isRealIsoDate(today)) {
    return result([], ['请填写有效的生日后再生成建议时间线。'])
  }

  if (utcDate(input.birthday).getTime() > utcDate(today).getTime()) {
    return result([], ['生日不能是未来日期，请修改后再试。'])
  }

  if (input.healthStatus === 'ill') {
    return result([], ['宠物当前有病症或不适：已暂停建议，请先由执业兽医评估并确认后续安排。'])
  }

  if (input.healthStatus === 'pregnant') {
    return result([], ['宠物处于孕期：已暂停建议，请由执业兽医确认适用的预防安排。'])
  }

  const ageInDays = Math.floor((utcDate(today).getTime() - utcDate(input.birthday).getTime()) / dayInMilliseconds)
  const events = ageInDays < youngPetDays
    ? youngPetRules(input.species).map((rule) => ({
        id: `${input.species}-${rule.category}-${addDays(input.birthday, rule.daysAfterBirthday)}`,
        category: rule.category,
        label: rule.label,
        startDate: addDays(input.birthday, rule.daysAfterBirthday),
        endDate: addDays(input.birthday, rule.daysAfterBirthday + rule.windowDays - 1),
        requiresVetConfirmation: true as const,
      }))
    : (() => {
        const labels = adultPetLabels(input.species)
        const annualDate = nextBirthday(input.birthday, today)
        return [
          {
            id: `${input.species}-vaccine-${annualDate}`,
            category: 'vaccine' as const,
            label: labels.vaccine,
            startDate: annualDate,
            endDate: addDays(annualDate, 13),
            requiresVetConfirmation: true as const,
          },
          {
            id: `${input.species}-deworming-${addDays(today, 90)}`,
            category: 'deworming' as const,
            label: labels.deworming,
            startDate: addDays(today, 90),
            endDate: addDays(today, 103),
            requiresVetConfirmation: true as const,
          },
        ]
      })()

  const coveredEventIds = new Set<string>()
  const warnings = input.records.flatMap((record) => {
    if (record.category === 'other' || !isRealIsoDate(record.date)) {
      return ['部分既往记录无法与本规则匹配，未据此猜测安排；请由执业兽医复核。']
    }

    const matchingEvent = events.find((event) => (
      event.category === record.category
      && record.date >= event.startDate
      && record.date <= event.endDate
    ))
    if (!matchingEvent) {
      return [`既往${record.category === 'vaccine' ? '疫苗' : '驱虫'}记录 ${record.date} 无法覆盖，需由执业兽医确认。`]
    }

    coveredEventIds.add(matchingEvent.id)
    return []
  })

  return result(
    events.filter((event) => !coveredEventIds.has(event.id)).sort((left, right) => left.startDate.localeCompare(right.startDate)),
    warnings,
  )
}
