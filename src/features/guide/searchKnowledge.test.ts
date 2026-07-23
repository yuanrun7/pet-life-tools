import { describe, expect, it } from 'vitest'

import { searchKnowledge } from './searchKnowledge'

describe('searchKnowledge', () => {
  it('matches a care topic through its keyword and synonym', () => {
    const byKeyword = searchKnowledge('狗狗口腔清洁')
    const bySynonym = searchKnowledge('猫咪刷牙')

    expect(byKeyword.map((entry) => entry.id)).toContain('dental-care')
    expect(bySynonym.map((entry) => entry.id)).toContain('dental-care')
  })

  it('returns no fabricated answer when the local collection has no match', () => {
    expect(searchKnowledge('金鱼掉鳞怎么办')).toEqual([])
  })

  it('does not treat a substring inside an unrelated short phrase as a match', () => {
    expect(searchKnowledge('想买刷子')).toEqual([])
  })

  it('does not match short Chinese fragments embedded in unrelated words', () => {
    expect(searchKnowledge('运动鞋')).toEqual([])
    expect(searchKnowledge('洗澡票')).toEqual([])
  })

  it('matches explicit care phrases that include formerly short topic words', () => {
    expect(searchKnowledge('狗狗运动量').map((entry) => entry.id)).toContain('dog-exercise')
    expect(searchKnowledge('多久洗澡').map((entry) => entry.id)).toContain('coat-care')
  })
})
