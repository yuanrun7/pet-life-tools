import type { TriageResult } from './triage'

const headingFor = (level: TriageResult['level']) => level === 'emergency' ? '请立即寻求动物医院或急诊帮助' : '建议尽快咨询执业兽医'

export function RiskBanner({ result }: { result: TriageResult }) {
  if (result.level === 'general') return null

  return <section className={`risk-banner risk-banner-${result.level}`} role="alert" aria-live="assertive">
    <p className="eyebrow">症状分流提示</p>
    <h2>{headingFor(result.level)}</h2>
    <p>{result.action}</p>
    {result.matchedFlags.length > 0 ? <p className="risk-flags">识别到：{result.matchedFlags.join('、')}</p> : null}
  </section>
}
