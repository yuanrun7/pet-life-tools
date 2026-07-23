import { useRef, useState } from 'react'

import { exportBackup, parseBackup } from './backup'
import { PetEditor, createId } from './PetEditor'
import { loadStore, saveStore } from './storage'
import type { Pet, PetStore } from './types'

const dateLabel = (value: string) => value || '未填写'

export function RecordsPage() {
  const [store, setStore] = useState<PetStore>(loadStore)
  const [editing, setEditing] = useState<Pet | undefined>()
  const [showEditor, setShowEditor] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function persist(next: PetStore) {
    const result = saveStore(next)
    if (result.ok) setStore(next)
    setMessage(result.ok ? '已保存到此设备。' : result.error === 'quota' ? '设备存储空间不足，未保存。' : '本地存储不可用，未保存。')
  }

  function savePet(pet: Pet) {
    persist({ ...store, pets: store.pets.some((item) => item.id === pet.id) ? store.pets.map((item) => item.id === pet.id ? pet : item) : [...store.pets, pet] })
    setShowEditor(false)
  }

  function deletePet(id: string) {
    persist({ ...store, pets: store.pets.filter((pet) => pet.id !== id), healthEvents: store.healthEvents.filter((item) => item.petId !== id), expenses: store.expenses.filter((item) => item.petId !== id), reminders: store.reminders.filter((item) => item.petId !== id) })
    setPendingDelete(null)
  }

  function downloadBackup() {
    const blob = new Blob([exportBackup(store)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pet-records-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function restore(file?: File) {
    if (!file || !window.confirm('恢复会覆盖此设备现有档案，确定继续吗？')) return
    try {
      persist(parseBackup(await file.text()))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '备份文件无效。')
    }
  }

  return <section className="records-page" aria-labelledby="records-title">
    <div className="records-intro"><p className="eyebrow">本地健康档案</p><h2 id="records-title">把每一位伙伴的日常留在自己的设备里</h2><p>图片不会写入档案；所有数据只保存在当前浏览器和设备中。</p></div>
    <div className="records-toolbar"><button type="button" onClick={() => { setEditing(undefined); setShowEditor(true) }}>添加宠物</button><button type="button" className="secondary-button" onClick={downloadBackup}>下载备份</button><button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>恢复备份</button><input ref={inputRef} className="sr-only" type="file" accept="application/json" onChange={(event) => void restore(event.currentTarget.files?.[0])} /></div>
    {message ? <p className="record-message" role="status">{message}</p> : null}
    {showEditor ? <PetEditor pet={editing} onSave={savePet} onCancel={() => setShowEditor(false)} /> : null}
    <div className="pet-cards">{store.pets.map((pet) => <article className="pet-card" key={pet.id}><div><p className="eyebrow">{pet.species === 'cat' ? '猫咪' : '狗狗'}</p><h3>{pet.name}</h3><p>生日：{dateLabel(pet.birthday)}</p><p>{pet.notes || '暂无备注'}</p></div><div className="record-actions"><button type="button" className="secondary-button" onClick={() => { setEditing(pet); setShowEditor(true) }}>编辑</button>{pendingDelete === pet.id ? <><button type="button" onClick={() => deletePet(pet.id)}>确认删除</button><button type="button" className="secondary-button" onClick={() => setPendingDelete(null)}>取消</button></> : <button type="button" className="danger-button" onClick={() => setPendingDelete(pet.id)}>删除</button>}</div></article>)}</div>
    {store.pets.length === 0 ? <p className="records-empty">还没有宠物档案，先添加一位伙伴吧。</p> : null}
    <div className="record-grid">
      <RecordList title="健康事件" rows={store.healthEvents.map((item) => `${item.date} · ${item.title}`)} />
      <RecordList title="费用记录" rows={store.expenses.map((item) => `${item.date} · ${item.title} · ¥${item.amount.toFixed(2)}`)} />
      <RecordList title="纪念与提醒" rows={store.reminders.map((item) => `${item.date} · ${item.title}`)} />
    </div>
  </section>
}

function RecordList({ title, rows }: { title: string; rows: string[] }) {
  return <section className="record-list"><h3>{title}</h3>{rows.length ? <ul>{rows.map((row, index) => <li key={`${row}-${index}`}>{row}</li>)}</ul> : <p>暂无记录</p>}</section>
}

export function saveScheduleEvents(store: PetStore, petId: string, events: ReadonlyArray<{ id: string; category: string; label: string; startDate: string }>): PetStore {
  return { ...store, healthEvents: [...store.healthEvents, ...events.map((event) => ({ id: createId(), petId, kind: event.category, date: event.startDate, title: event.label, notes: '由照护日程保存' }))] }
}
