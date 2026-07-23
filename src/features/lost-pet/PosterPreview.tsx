import { useEffect, useState } from 'react'

import { renderPoster } from './renderPoster'
import { downloadPoster, hasRequiredPosterFields, shareSocialPoster } from './posterActions'
import type { LostPetPosterInput, PosterFormat } from './types'

function download(blob: Blob, format: PosterFormat) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `寻宠海报-${format}.png`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function PosterPreview({ input }: { input: LostPetPosterInput }) {
  const [photoUrl, setPhotoUrl] = useState<string>()
  const [message, setMessage] = useState('')
  const isValid = hasRequiredPosterFields(input)

  useEffect(() => {
    if (!input.photo) {
      setPhotoUrl(undefined)
      return
    }
    const url = URL.createObjectURL(input.photo)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [input.photo])

  async function exportPoster(format: PosterFormat) {
    try {
      const result = await downloadPoster(input, format, { render: renderPoster, download })
      setMessage(result === 'invalid' ? '请先填写所有必填信息。' : `${format === 'social' ? '朋友圈' : 'A4'} 海报已下载。`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '海报生成失败，请重试。')
    }
  }

  async function sharePoster() {
    try {
      const result = await shareSocialPoster(input, { render: renderPoster, download, canShare: navigator.canShare?.bind(navigator), share: navigator.share?.bind(navigator) })
      if (result === 'shared') setMessage('海报已打开分享。')
      else if (result === 'downloaded') setMessage('当前浏览器不支持分享或分享失败，已下载海报。')
      else if (result === 'invalid') setMessage('请先填写所有必填信息。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '海报生成失败，请重试。')
    }
  }

  return <aside className="poster-preview" aria-live="polite">
    <p className="eyebrow">即时预览</p>
    <div className="poster-sheet">
      <h2>走失寻宠</h2>
      {photoUrl ? <img src={photoUrl} alt={`${input.petName || '宠物'}的照片预览`} /> : <div className="poster-photo-empty">尚未选择照片</div>}
      <p><strong>{input.petName || '宠物名称'}</strong></p>
      <dl><div><dt>走失时间</dt><dd>{input.lostAt || '待补充'}</dd></div><div><dt>走失地点</dt><dd>{input.location || '待补充'}</dd></div><div><dt>特征</dt><dd>{input.features || '待补充'}</dd></div><div><dt>联系方式</dt><dd>{input.contact || '待补充'}</dd></div>{input.reward && <div><dt>酬谢</dt><dd>{input.reward}</dd></div>}</dl>
    </div>
    <div className="poster-actions"><button type="button" disabled={!isValid} onClick={() => void exportPoster('social')}>下载朋友圈海报</button><button type="button" disabled={!isValid} className="secondary-button" onClick={() => void exportPoster('a4')}>下载 A4 海报</button><button type="button" disabled={!isValid} className="share-button" onClick={() => void sharePoster()}>分享朋友圈（或下载）</button></div>
    {message && <p className="poster-message">{message}</p>}
  </aside>
}
