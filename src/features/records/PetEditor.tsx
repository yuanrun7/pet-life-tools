import { useState, type FormEvent } from 'react'

import type { Pet } from './types'

export function PetEditor({ pet, onSave, onCancel }: { pet?: Pet; onSave: (pet: Pet) => void; onCancel: () => void }) {
  const [name, setName] = useState(pet?.name ?? '')
  const [species, setSpecies] = useState<Pet['species']>(pet?.species ?? 'cat')
  const [birthday, setBirthday] = useState(pet?.birthday ?? '')
  const [notes, setNotes] = useState(pet?.notes ?? '')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      setError('请填写名称和生日。')
      return
    }
    onSave({ id: pet?.id ?? createId(), name: name.trim(), species, birthday, notes: notes.trim() })
  }

  return <form className="pet-editor" onSubmit={submit} noValidate>
    <label>名称<input value={name} onChange={(event) => setName(event.currentTarget.value)} /></label>
    <label>类型<select value={species} onChange={(event) => setSpecies(event.currentTarget.value === 'dog' ? 'dog' : 'cat')}><option value="cat">猫</option><option value="dog">狗</option></select></label>
    <label>生日<input type="date" value={birthday} onChange={(event) => setBirthday(event.currentTarget.value)} /></label>
    <label className="full-field">备注<textarea value={notes} onChange={(event) => setNotes(event.currentTarget.value)} rows={2} /></label>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <div className="record-actions"><button type="submit">保存宠物</button><button type="button" className="secondary-button" onClick={onCancel}>取消</button></div>
  </form>
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
