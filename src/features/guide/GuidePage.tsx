import { useState, type FormEvent } from 'react'

import { RiskBanner } from './RiskBanner'
import { searchKnowledge } from './searchKnowledge'
import { triage, type TriageResult } from './triage'

const speciesLabel = { cat: '仅猫', dog: '仅狗', both: '猫与狗' } as const

export function GuidePage() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null)

  const triageResult: TriageResult | null = submittedQuery === null ? null : triage(submittedQuery)
  const results = triageResult?.level === 'general' && submittedQuery ? searchKnowledge(submittedQuery) : []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedQuery(query.trim())
  }

  return <section className="guide-page" aria-labelledby="guide-title">
    <div className="guide-intro"><p className="eyebrow">本地知识检索</p><h2 id="guide-title">先识别风险，再查看照护资料</h2><p>本地知识检索，不是 AI 诊断。内容仅适用于猫与狗，并保留来源、更新时间与适用范围供复核。</p></div>
    <form className="guide-search" onSubmit={handleSubmit}>
      <label htmlFor="guide-query">输入症状或日常照护主题</label>
      <div><input id="guide-query" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="例如：猫咪刷牙、狗狗呼吸困难" /><button type="submit">检索本地资料</button></div>
    </form>
    {triageResult ? <RiskBanner result={triageResult} /> : null}
    {triageResult?.level === 'general' && submittedQuery ? <section className="guide-results" aria-live="polite" aria-labelledby="guide-results-title">
      <div className="guide-result-heading"><p className="eyebrow">本地条目</p><h2 id="guide-results-title">{results.length > 0 ? '可供阅读与复核的资料' : '未找到对应的本地资料'}</h2></div>
      {results.length > 0 ? <div className="guide-entry-list">{results.map((entry) => <article className="guide-entry" key={entry.id}>
        <div><p className="guide-species">适用：{speciesLabel[entry.species]}</p><h3>{entry.title}</h3><p>{entry.summary}</p></div>
        <dl><div><dt>来源机构</dt><dd>{entry.source.organization}</dd></div><div><dt>指南名称</dt><dd>{entry.source.guide}</dd></div><div><dt>可阅读说明</dt><dd>{entry.source.note}</dd></div><div><dt>更新时间</dt><dd>{entry.updatedAt}</dd></div></dl>
      </article>)}</div> : <p className="guide-empty">本地知识库没有可审核的对应条目。请咨询执业兽医，勿将本页作为诊断或处置依据。</p>}
    </section> : null}
  </section>
}
