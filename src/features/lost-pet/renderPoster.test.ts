import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderPoster } from './renderPoster'

const input = { petName: '团子', lostAt: '2026-07-22 10:30', location: '公园北门', features: '橘白猫，蓝色项圈', contact: '13800138000', reward: '500 元' }

function installCanvas() {
  const context = { fillRect: vi.fn(), fillText: vi.fn(), measureText: vi.fn((text: string) => ({ width: Math.max(1, Number(context.font.match(/(\d+)px/)?.[1]) * 0.55) * [...text].length })), drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), clip: vi.fn(), font: '', fillStyle: '', textBaseline: 'alphabetic' }
  const canvas = { width: 0, height: 0, getContext: vi.fn(() => context), toBlob: (callback: BlobCallback) => callback(new Blob(['poster'], { type: 'image/png' })) }
  vi.stubGlobal('document', { createElement: vi.fn(() => canvas) })
  return { canvas, context }
}

afterEach(() => vi.unstubAllGlobals())

describe('renderPoster', () => {
  it('renders the social size without a photo', async () => {
    const { canvas, context } = installCanvas()

    await expect(renderPoster(input, 'social')).resolves.toBeInstanceOf(Blob)
    expect(canvas).toMatchObject({ width: 1080, height: 1440 })
    expect(context.fillText).toHaveBeenCalledWith('联系方式', expect.any(Number), expect.any(Number))
  })

  it('keeps a textual A4 poster when the photo cannot be decoded', async () => {
    const { canvas, context } = installCanvas()
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:pet'), revokeObjectURL })
    vi.stubGlobal('Image', class { onload: (() => void) | null = null; onerror: (() => void) | null = null; set src(_value: string) { this.onerror?.() } })

    await expect(renderPoster({ ...input, photo: new File(['x'], 'pet.png', { type: 'image/png' }) }, 'a4')).resolves.toBeInstanceOf(Blob)
    expect(canvas).toMatchObject({ width: 2480, height: 3508 })
    expect(context.fillText).toHaveBeenCalledWith('走失寻宠', expect.any(Number), expect.any(Number))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:pet')
  })

  it.each(['social', 'a4'] as const)('keeps maximum features and contact within the %s poster', async (format) => {
    const { canvas, context } = installCanvas()
    const features = '特'.repeat(300)
    const contact = '1'.repeat(120)

    await renderPoster({ ...input, features, contact }, format)

    const textCalls = context.fillText.mock.calls
    expect(textCalls.map(([text]) => text).filter((text) => text !== '特征' && text.includes('特')).join('')).toBe(features)
    expect(textCalls.map(([text]) => text).filter((text) => /^1+$/.test(text)).join('')).toBe(contact)
    expect(textCalls.every(([, , y]) => y > 0 && y <= canvas.height)).toBe(true)
  })

  it('clips a successful photo before drawing it with cover logic', async () => {
    const { context } = installCanvas()
    const order: string[] = []
    context.save.mockImplementation(() => order.push('save'))
    context.beginPath.mockImplementation(() => order.push('beginPath'))
    context.rect.mockImplementation(() => order.push('rect'))
    context.clip.mockImplementation(() => order.push('clip'))
    context.drawImage.mockImplementation(() => order.push('drawImage'))
    context.restore.mockImplementation(() => order.push('restore'))
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:pet'), revokeObjectURL: vi.fn() })
    vi.stubGlobal('Image', class { naturalWidth = 1200; naturalHeight = 800; onload: (() => void) | null = null; set src(_value: string) { this.onload?.() } })

    await renderPoster({ ...input, photo: new File(['x'], 'pet.png', { type: 'image/png' }) }, 'social')

    expect(order).toEqual(['save', 'beginPath', 'rect', 'clip', 'drawImage', 'restore'])
  })
})
