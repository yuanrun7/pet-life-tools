import { useState } from 'react'

import { PosterPreview } from './PosterPreview'
import type { LostPetPosterInput } from './types'

const blankInput: LostPetPosterInput = { petName: '', lostAt: '', location: '', features: '', contact: '', reward: '' }

export function LostPetPage() {
  const [input, setInput] = useState<LostPetPosterInput>(blankInput)
  const [error, setError] = useState('')
  const update = (field: Exclude<keyof LostPetPosterInput, 'photo'>, value: string) => setInput((current) => ({ ...current, [field]: value }))

  function validate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = ['petName', 'lostAt', 'location', 'features', 'contact'].some((field) => !input[field as Exclude<keyof LostPetPosterInput, 'photo'>].trim())
    setError(missing ? '请填写宠物名称、走失时间地点、特征和联系方式。' : '')
  }

  return <section className="lost-pet-page">
    <div className="lost-pet-intro"><p className="eyebrow">紧急信息整理</p><h2>先让信息清楚，再让更多人看见</h2><p>照片仅用于本次海报生成，不会保存到本地记录；本工具不提供 AI 抠图或修复。</p></div>
    <div className="lost-pet-layout"><form className="lost-pet-form" onSubmit={validate} noValidate>
      <label>宠物名称<input value={input.petName} onChange={(event) => update('petName', event.target.value)} maxLength={40} required /></label>
      <label>走失时间<input type="datetime-local" value={input.lostAt} onChange={(event) => update('lostAt', event.target.value)} required /></label>
      <label>走失地点<input value={input.location} onChange={(event) => update('location', event.target.value)} maxLength={80} required /></label>
      <label>联系方式<input value={input.contact} onChange={(event) => update('contact', event.target.value)} maxLength={120} required /></label>
      <label className="full-field">特征<textarea value={input.features} onChange={(event) => update('features', event.target.value)} maxLength={300} required /></label>
      <label>酬谢（可选）<input value={input.reward} onChange={(event) => update('reward', event.target.value)} maxLength={40} /></label>
      <label>宠物照片（可选）<input type="file" accept="image/*" onChange={(event) => setInput((current) => ({ ...current, photo: event.target.files?.[0] }))} /></label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit">检查必填信息</button>
    </form><PosterPreview input={input} /></div>
  </section>
}
