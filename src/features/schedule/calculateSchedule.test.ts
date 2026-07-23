import { describe, expect, it } from 'vitest'

import { calculateSchedule } from './calculateSchedule'

const today = '2026-07-22'

describe('calculateSchedule', () => {
  it.each([
    ['cat', '幼猫'],
    ['dog', '幼犬'],
  ] as const)('creates a basic suggestion timeline for a %s kitten or puppy', (species, expectedSpecies) => {
    const result = calculateSchedule({ species, birthday: '2026-06-01', healthStatus: 'healthy', records: [], now: today })

    expect(result.events.map((event) => event.category)).toContain('vaccine')
    expect(result.events.map((event) => event.category)).toContain('deworming')
    expect(result.events.every((event) => event.label.includes(expectedSpecies))).toBe(true)
    expect(result.events[0]).toMatchObject({ startDate: '2026-06-15', endDate: '2026-06-21' })
    expect(result.warnings).toHaveLength(0)
  })

  it('creates review windows for an adult pet', () => {
    const result = calculateSchedule({ species: 'cat', birthday: '2022-03-15', healthStatus: 'healthy', records: [], now: today })

    expect(result.events.map((event) => event.label)).toEqual([
      '成年猫定期驱虫复核建议',
      '成年猫年度疫苗复核建议',
    ])
    expect(result.events.map((event) => event.startDate)).toEqual(['2026-10-20', '2027-03-15'])
  })

  it('removes a suggested event already present in history', () => {
    const result = calculateSchedule({
      species: 'dog',
      birthday: '2026-06-01',
      healthStatus: 'healthy',
      records: [{ category: 'vaccine', date: '2026-07-27' }],
      now: today,
    })

    expect(result.events.some((event) => event.startDate === '2026-07-27' && event.category === 'vaccine')).toBe(false)
  })

  it('warns when a valid vaccine or deworming record falls outside every rule window', () => {
    const result = calculateSchedule({
      species: 'dog',
      birthday: '2026-06-01',
      healthStatus: 'healthy',
      records: [{ category: 'deworming', date: '2026-12-01' }],
      now: today,
    })

    expect(result.warnings.join('')).toMatch(/无法覆盖.*执业兽医/)
  })

  it('warns instead of guessing when history cannot be covered by a rule', () => {
    const result = calculateSchedule({
      species: 'cat',
      birthday: '2025-01-01',
      healthStatus: 'healthy',
      records: [{ category: 'other', date: '2026-07-01' }],
      now: today,
    })

    expect(result.warnings.join('')).toContain('无法与本规则匹配')
  })

  it('rejects a birthday in the future', () => {
    const result = calculateSchedule({ species: 'cat', birthday: '2026-07-23', healthStatus: 'healthy', records: [], now: today })

    expect(result.events).toEqual([])
    expect(result.warnings.join('')).toContain('未来')
  })

  it('rejects calendar dates that match the format but do not exist', () => {
    const result = calculateSchedule({
      species: 'cat',
      birthday: '2026-02-30',
      healthStatus: 'healthy',
      records: [{ category: 'vaccine', date: '2026-02-30' }],
      now: today,
    })

    expect(result.events).toEqual([])
    expect(result.warnings.join('')).toContain('有效的生日')
  })

  it.each(['ill', 'pregnant'] as const)('pauses suggestions for %s status and asks for veterinarian confirmation', (healthStatus) => {
    const result = calculateSchedule({ species: 'dog', birthday: '2025-01-01', healthStatus, records: [], now: today })

    expect(result.events).toEqual([])
    expect(result.warnings.join('')).toMatch(/暂停.*执业兽医/)
  })
})
