import { describe, expect, it } from 'vitest'

import { triage } from './triage'

describe('triage', () => {
  it.each(['呼吸困难', '突然抽搐', '持续出血'])('routes %s to emergency care', (query) => {
    const result = triage(query)

    expect(result.level).toBe('emergency')
    expect(result.action).toMatch(/动物医院|急诊/)
    expect(JSON.stringify(result)).not.toMatch(/在家|喂药|剂量/)
  })

  it('keeps ordinary daily care in the general route', () => {
    expect(triage('日常梳毛和清洁')).toMatchObject({ level: 'general' })
  })

  it('does not escalate explicitly negated red-flag phrases', () => {
    expect(triage('没有呼吸困难，只是想了解日常护理')).toMatchObject({ level: 'general' })
    expect(triage('不抽搐，精神正常')).toMatchObject({ level: 'general' })
    expect(triage('不是持续出血，是毛发染色')).toMatchObject({ level: 'general' })
  })

  it('escalates when a later occurrence of the same flag is not negated', () => {
    expect(triage('起初没有呼吸困难，现在呼吸困难')).toMatchObject({ level: 'emergency' })
  })

  it.each(['没有出现呼吸困难', '未见明显呼吸困难', '否认有呼吸困难'])('does not escalate the inserted negation context %s', (query) => {
    expect(triage(query)).not.toMatchObject({ level: 'emergency' })
  })
})
