import { useState, type ChangeEvent } from 'react'

import { calculateCost } from './calculateCost'
import { createCustomCostItem } from './customItem'
import { getCostTemplate, type PetSpecies } from './defaults'
import { CostBreakdown } from './CostBreakdown'
import type { CostCadence, CostItem, CostNecessity } from './types'
import type { Pet } from '../records/types'

const cadenceOptions: ReadonlyArray<{ value: CostCadence; label: string }> = [
  { value: 'upfront', label: '一次性' }, { value: 'monthly', label: '每月' }, { value: 'annual', label: '每年' }, { value: 'reserve', label: '年度医疗备用' },
]

function templateValues(species: PetSpecies) {
  const template = getCostTemplate(species)
  return { lifespanYears: template.lifespanYears, items: template.items }
}

export function CostPage({ pets, onSaveExpense }: { pets: readonly Pet[]; onSaveExpense: (petId: string, amount: number) => boolean }) {
  const initial = templateValues('cat')
  const [species, setSpecies] = useState<PetSpecies>('cat')
  const [lifespanYears, setLifespanYears] = useState(initial.lifespanYears)
  const [items, setItems] = useState<CostItem[]>(initial.items)
  const [saveMessage, setSaveMessage] = useState('')
  const [petId, setPetId] = useState(pets.length === 1 ? pets[0]!.id : '')

  function switchTemplate(nextSpecies: PetSpecies) {
    const template = templateValues(nextSpecies)
    setSpecies(nextSpecies)
    setLifespanYears(template.lifespanYears)
    setItems(template.items)
  }

  function updateItem(id: string, field: keyof Pick<CostItem, 'label' | 'amount' | 'cadence' | 'necessity'>, value: string | number) {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item
      if (field === 'label') return { ...item, label: String(value) }
      if (field === 'amount') return { ...item, amount: Number(value) }
      if (field === 'cadence') return { ...item, cadence: value === 'monthly' || value === 'annual' || value === 'reserve' ? value : 'upfront' }
      return { ...item, necessity: value === 'optional' ? 'optional' : 'essential' }
    }))
  }

  function updateAmount(id: string, event: ChangeEvent<HTMLInputElement>) {
    const amount = event.currentTarget.valueAsNumber
    updateItem(id, 'amount', Number.isFinite(amount) ? Math.max(0, amount) : 0)
  }

  const summary = calculateCost({ lifespanYears, items })

  function saveExpense() {
    if (!petId) return
    setSaveMessage(onSaveExpense(petId, summary.firstYear) ? '已保存到所选宠物档案。' : '所选宠物不存在，请重新选择。')
  }

  return <section className="cost-page" aria-labelledby="cost-form-title">
    <div className="cost-intro"><p className="eyebrow">可编辑的预算模板</p><h2 id="cost-form-title">把养宠计划写成自己的账本</h2><p>猫和狗的数字都是示例值，请按实际情况编辑；它们不是实时均价，也不构成消费建议。</p></div>
    <div className="cost-editor"><div className="cost-controls"><label>宠物类型<select value={species} onChange={(event) => switchTemplate(event.currentTarget.value === 'dog' ? 'dog' : 'cat')}><option value="cat">猫</option><option value="dog">狗</option></select></label><label>预计陪伴年数<input type="number" min="0" step="1" value={lifespanYears} onChange={(event) => setLifespanYears(Math.max(0, Number(event.currentTarget.value) || 0))} /></label><p className="example-badge">示例值 · 请按实际情况编辑</p></div>
      <div className="cost-table-wrap"><table className="cost-table"><caption>费用项目可随时修改或补充</caption><thead><tr><th scope="col">项目</th><th scope="col">金额（元）</th><th scope="col">频率</th><th scope="col">分类</th><th scope="col"><span className="sr-only">删除</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><input aria-label={`${item.label}项目名称`} value={item.label} onChange={(event) => updateItem(item.id, 'label', event.currentTarget.value)} /></td><td><input aria-label={`${item.label}金额`} type="number" min="0" step="1" value={item.amount} onChange={(event) => updateAmount(item.id, event)} /></td><td><select aria-label={`${item.label}频率`} value={item.cadence} onChange={(event) => updateItem(item.id, 'cadence', event.currentTarget.value)}>{cadenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td><select aria-label={`${item.label}分类`} value={item.necessity} onChange={(event) => updateItem(item.id, 'necessity', event.currentTarget.value)}><option value="essential">刚需</option><option value="optional">可选</option></select></td><td><button type="button" className="remove-cost-item" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}>删除</button></td></tr>)}</tbody></table></div>
      <button type="button" className="secondary-button add-cost-item" onClick={() => setItems((current) => [...current, createCustomCostItem()])}>添加自定义项目</button>
    </div>
    <div className="record-actions"><label className="save-target">保存到<select value={petId} onChange={(event) => setPetId(event.currentTarget.value)} disabled={pets.length === 0}><option value="">{pets.length === 0 ? '请先添加宠物' : pets.length > 1 ? '请选择宠物' : '所选宠物'}</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></label><button type="button" className="secondary-button" onClick={saveExpense} disabled={!petId}>将首年预算保存为费用记录</button>{saveMessage ? <p className="record-message" role="status">{saveMessage}</p> : null}</div>
    <CostBreakdown summary={summary} />
  </section>
}
