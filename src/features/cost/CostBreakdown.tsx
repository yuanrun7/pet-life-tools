import type { CostCadence, CostDetail, CostSummary } from './types'

const cadenceLabels: Record<CostCadence, string> = {
  upfront: '一次性',
  monthly: '每月',
  annual: '每年',
  reserve: '年度医疗备用',
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function DetailGroup({ title, details }: { title: string; details: CostDetail[] }) {
  return (
    <section className="cost-detail-group" aria-label={title}>
      <h3>{title}</h3>
      {details.length === 0 ? <p>暂未填写项目。</p> : (
        <ul>
          {details.map((item) => (
            <li key={item.id}>
              <span>{item.label}<small>{cadenceLabels[item.cadence]}</small></span>
              <strong>{formatCurrency(item.amount)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function CostBreakdown({ summary }: { summary: CostSummary }) {
  const annualRoutine = summary.monthly * 12 + summary.annual + summary.reserve
  const monthlyAverage = annualRoutine / 12
  const essential = summary.details.filter((item) => item.necessity === 'essential')
  const optional = summary.details.filter((item) => item.necessity === 'optional')

  return (
    <section className="cost-results" aria-live="polite" aria-labelledby="cost-results-title">
      <div className="cost-result-heading">
        <div>
          <p className="eyebrow">预算预览</p>
          <h2 id="cost-results-title">用自己的数字，看到更从容的准备</h2>
        </div>
        <p>金额随表单即时更新，仅供个人预算整理。</p>
      </div>
      <dl className="cost-summary-grid">
        <div><dt>月均常态支出</dt><dd>{formatCurrency(monthlyAverage)}</dd><small>含年度项目与备用金折算</small></div>
        <div><dt>年度常态支出</dt><dd>{formatCurrency(annualRoutine)}</dd><small>不含一次性准备</small></div>
        <div><dt>第一年合计</dt><dd>{formatCurrency(summary.firstYear)}</dd><small>含一次性准备与备用金</small></div>
        <div><dt>预计生命周期</dt><dd>{formatCurrency(summary.lifetime)}</dd><small>一次性费用仅计算一次</small></div>
      </dl>
      <div className="cost-detail-groups">
        <DetailGroup title="刚需项目" details={essential} />
        <DetailGroup title="可选项目" details={optional} />
      </div>
    </section>
  )
}
