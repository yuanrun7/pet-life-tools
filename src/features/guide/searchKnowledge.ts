import { knowledgeEntries, type KnowledgeEntry } from './knowledge'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase()
}

function matchesAuditablePhrase(query: string, keyword: string) {
  return keyword.length >= 3 && query.includes(keyword)
}

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  return knowledgeEntries.filter((entry) => entry.keywords.some((keyword) => matchesAuditablePhrase(normalizedQuery, normalize(keyword))))
}
