export type TriageLevel = 'emergency' | 'vet-soon' | 'general'

export type TriageResult = {
  level: TriageLevel
  action: string
  matchedFlags: readonly string[]
}

type TriageRule = { label: string; phrases: readonly string[] }

const emergencyRules: readonly TriageRule[] = [
  { label: '呼吸困难', phrases: ['呼吸困难', '呼吸急促', '喘不过气', '张口呼吸'] },
  { label: '抽搐', phrases: ['抽搐', '痉挛', '惊厥'] },
  { label: '持续出血', phrases: ['持续出血', '大量出血', '止不住血', '流血不止'] },
]

const vetSoonRules: readonly TriageRule[] = [
  { label: '持续呕吐或腹泻', phrases: ['持续呕吐', '反复呕吐', '持续腹泻', '反复腹泻'] },
  { label: '食欲明显下降', phrases: ['不吃东西', '拒食', '食欲不振'] },
  { label: '持续跛行', phrases: ['持续跛行', '不能走路'] },
]

function isNegated(text: string, index: number, phraseLength: number) {
  const before = text.slice(Math.max(0, index - 8), index)
  const after = text.slice(index + phraseLength, index + phraseLength + 8)
  return /(?:没有|并无|未见|否认)(?:有|出现|明显){0,2}\s*$|(?:不是|不|无)\s*$/.test(before) || /^\s*(?:吗)?\s*(?:没有|并无|未见|无)/.test(after)
}

function hasUnnegatedPhrase(query: string, phrase: string) {
  let index = query.indexOf(phrase)
  while (index >= 0) {
    if (!isNegated(query, index, phrase.length)) return true
    index = query.indexOf(phrase, index + phrase.length)
  }
  return false
}

function matchingLabels(query: string, rules: readonly TriageRule[]) {
  return rules.flatMap((rule) => rule.phrases.some((phrase) => hasUnnegatedPhrase(query, phrase)) ? [rule.label] : [])
}

export function triage(query: string): TriageResult {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const emergencyFlags = matchingLabels(normalizedQuery, emergencyRules)
  if (emergencyFlags.length > 0) {
    return {
      level: 'emergency',
      action: '请立即联系附近动物医院或急诊服务，并说明观察到的症状。',
      matchedFlags: emergencyFlags,
    }
  }

  const vetSoonFlags = matchingLabels(normalizedQuery, vetSoonRules)
  if (vetSoonFlags.length > 0) {
    return {
      level: 'vet-soon',
      action: '建议尽快咨询执业兽医，确认是否需要安排就诊。',
      matchedFlags: vetSoonFlags,
    }
  }

  return {
    level: 'general',
    action: '可浏览下方本地知识条目；如症状持续、加重或让你担心，请咨询执业兽医。',
    matchedFlags: [],
  }
}
