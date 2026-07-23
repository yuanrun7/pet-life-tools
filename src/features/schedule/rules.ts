import type { PetSpecies, ScheduleCategory } from './types'

export const ruleMetadata = {
  ruleVersion: 'care-schedule-cn-2026.07',
  reviewedAt: '2026-07-22',
  scope: '仅适用于猫与犬的日常预防安排参考；具体项目、间隔和接种条件须由执业兽医确认。',
} as const

export interface RuleSuggestion {
  category: ScheduleCategory
  label: string
  daysAfterBirthday: number
  windowDays: number
}

function speciesName(species: PetSpecies, lifeStage: 'young' | 'adult') {
  const name = species === 'cat' ? '猫' : '犬'
  return lifeStage === 'young' ? `幼${name}` : `成年${name}`
}

export function youngPetRules(species: PetSpecies): readonly RuleSuggestion[] {
  const name = speciesName(species, 'young')

  return [
    { category: 'deworming', label: `${name}驱虫复核建议（第 1 次）`, daysAfterBirthday: 14, windowDays: 7 },
    { category: 'deworming', label: `${name}驱虫复核建议（第 2 次）`, daysAfterBirthday: 28, windowDays: 7 },
    { category: 'vaccine', label: `${name}基础疫苗复核建议（第 1 次）`, daysAfterBirthday: 56, windowDays: 7 },
    { category: 'vaccine', label: `${name}基础疫苗复核建议（第 2 次）`, daysAfterBirthday: 84, windowDays: 7 },
    { category: 'vaccine', label: `${name}基础疫苗复核建议（第 3 次）`, daysAfterBirthday: 112, windowDays: 7 },
  ]
}

export function adultPetLabels(species: PetSpecies) {
  const name = speciesName(species, 'adult')
  return {
    vaccine: `${name}年度疫苗复核建议`,
    deworming: `${name}定期驱虫复核建议`,
  }
}
