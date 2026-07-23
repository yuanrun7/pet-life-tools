import { useState, type FormEvent } from 'react'

import { createCalendar } from './calendar'
import { calculateSchedule, isRealIsoDate } from './calculateSchedule'
import { scheduleObjectUrlRelease } from './download'
import { ScheduleTimeline } from './ScheduleTimeline'
import type { HealthStatus, PetSpecies, ScheduleRecord, ScheduleResult } from './types'
import type { Pet } from '../records/types'

type SavedScheduleEvent = { id: string; category: string; label: string; startDate: string }

const currentDate = () => new Date().toISOString().slice(0, 10)

function parseRecords(value: string): { records: ScheduleRecord[]; valid: boolean } {
  const rows = value.split('\n').map((row) => row.trim()).filter(Boolean)
  const records: ScheduleRecord[] = []
  for (const row of rows) {
    const [rawCategory, rawDate, ...extra] = row.split(/[,，]/).map((part) => part.trim())
    if (!rawCategory || !rawDate || extra.length > 0 || !isRealIsoDate(rawDate)) return { records: [], valid: false }
    records.push({ category: rawCategory.includes('疫苗') ? 'vaccine' : rawCategory.includes('驱虫') ? 'deworming' : 'other', date: rawDate })
  }
  return { records, valid: true }
}

export function SchedulePage({ pets, onSaveEvents }: { pets: readonly Pet[]; onSaveEvents: (petId: string, events: SavedScheduleEvent[]) => boolean }) {
  const [species, setSpecies] = useState<PetSpecies>('cat')
  const [birthday, setBirthday] = useState('')
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy')
  const [recordText, setRecordText] = useState('')
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState<ScheduleResult | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [petId, setPetId] = useState(pets.length === 1 ? pets[0]!.id : '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const today = currentDate()
    const parsedRecords = parseRecords(recordText)
    if (!isRealIsoDate(birthday) || birthday > today) {
      setFormError('请填写不晚于今天的生日。')
      setResult(null)
      return
    }
    if (!parsedRecords.valid) {
      setFormError('既往记录请每行填写“疫苗或驱虫, YYYY-MM-DD”。')
      setResult(null)
      return
    }
    setFormError('')
    setResult(calculateSchedule({ species, birthday, healthStatus, records: parsedRecords.records, now: today }))
  }

  function updateEventDate(id: string, field: 'startDate' | 'endDate', date: string) {
    setResult((current) => current && { ...current, events: current.events.map((event) => event.id === id ? { ...event, [field]: date } : event) })
  }

  function downloadCalendar() {
    if (!result || result.events.length === 0) return
    const file = new Blob([createCalendar(result.events)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pet-care-suggestions.ics'
    link.click()
    scheduleObjectUrlRelease(url)
  }

  function saveEvents() {
    if (!result || !petId) return
    setSaveMessage(onSaveEvents(petId, result.events) ? '已保存到所选宠物档案。' : '所选宠物不存在，请重新选择。')
  }

  return <section className="schedule-page" aria-labelledby="schedule-form-title">
    <div className="schedule-intro"><p className="eyebrow">版本化建议规则</p><h2 id="schedule-form-title">生成可复核的猫狗照护时间线</h2><p>规则仅给出建议时间窗口，请结合宠物实际情况与兽医建议确认。</p></div>
    <form className="schedule-form" onSubmit={handleSubmit} noValidate>
      <label>宠物类型<select value={species} onChange={(event) => setSpecies(event.currentTarget.value === 'dog' ? 'dog' : 'cat')}><option value="cat">猫</option><option value="dog">狗</option></select></label>
      <label>生日<input type="date" value={birthday} max={currentDate()} onChange={(event) => setBirthday(event.currentTarget.value)} required /></label>
      <label>健康状态<select value={healthStatus} onChange={(event) => setHealthStatus(event.currentTarget.value === 'pregnant' ? 'pregnant' : event.currentTarget.value === 'ill' ? 'ill' : 'healthy')}><option value="healthy">目前健康</option><option value="ill">有病症或不适</option><option value="pregnant">孕期</option></select></label>
      <label className="schedule-records-field">既往记录（每行：疫苗或驱虫, YYYY-MM-DD）<textarea value={recordText} onChange={(event) => setRecordText(event.currentTarget.value)} rows={4} placeholder={'疫苗, 2026-07-27\n驱虫, 2026-07-13'} /></label>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <button type="submit">生成建议时间线</button>
    </form>
    {result ? <section className="schedule-results" aria-live="polite" aria-labelledby="schedule-results-title">
      <div className="schedule-result-heading"><div><p className="eyebrow">建议结果</p><h2 id="schedule-results-title">请逐项与执业兽医复核</h2></div>{result.events.length > 0 ? <div className="record-actions"><button type="button" className="secondary-button" onClick={downloadCalendar}>下载日历 .ics</button><label className="save-target">保存到<select value={petId} onChange={(event) => setPetId(event.currentTarget.value)} disabled={pets.length === 0}><option value="">{pets.length === 0 ? '请先添加宠物' : pets.length > 1 ? '请选择宠物' : '所选宠物'}</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></label><button type="button" className="secondary-button" onClick={saveEvents} disabled={!petId}>保存到档案</button></div> : null}</div>
      <dl className="rule-metadata"><div><dt>规则版本</dt><dd>{result.ruleVersion}</dd></div><div><dt>复核日期</dt><dd>{result.reviewedAt}</dd></div><div><dt>适用范围</dt><dd>{result.scope}</dd></div></dl>
      <p className="medical-warning">医疗提示：本页面不能替代执业兽医，也不提供诊断、处方或剂量建议。</p>
      {result.warnings.map((warning) => <p className="schedule-warning" role="alert" key={warning}>{warning}</p>)}
      <ScheduleTimeline events={result.events} onDateChange={updateEventDate} />
      {saveMessage ? <p className="record-message" role="status">{saveMessage}</p> : null}
    </section> : null}
  </section>
}
