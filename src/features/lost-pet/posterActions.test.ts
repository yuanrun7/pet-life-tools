import { describe, expect, it, vi } from 'vitest'

import { downloadPoster, hasRequiredPosterFields, shareSocialPoster } from './posterActions'
import type { LostPetPosterInput } from './types'

const complete: LostPetPosterInput = { petName: '团子', lostAt: '2026-07-22T10:30', location: '公园北门', features: '橘白猫', contact: '13800138000', reward: '' }

const blob = new Blob(['poster'], { type: 'image/png' })

describe('poster actions', () => {
  it('uses one required-field gate for downloads and sharing', async () => {
    const render = vi.fn(async () => blob)
    const download = vi.fn()
    const incomplete = { ...complete, contact: '  ' }

    expect(hasRequiredPosterFields(incomplete)).toBe(false)
    await expect(downloadPoster(incomplete, 'social', { render, download })).resolves.toBe('invalid')
    await expect(shareSocialPoster(incomplete, { render, download })).resolves.toBe('invalid')
    expect(render).not.toHaveBeenCalled()
    expect(download).not.toHaveBeenCalled()
  })

  it('downloads when canShare is missing or false', async () => {
    for (const canShare of [undefined, vi.fn(() => false)]) {
      const download = vi.fn()
      const share = vi.fn()

      await expect(shareSocialPoster(complete, { render: async () => blob, download, canShare, share })).resolves.toBe('downloaded')
      expect(download).toHaveBeenCalledWith(blob, 'social')
      expect(share).not.toHaveBeenCalled()
    }
  })

  it('shares only after canShare explicitly returns true', async () => {
    const canShare = vi.fn(() => true)
    const share = vi.fn()
    const download = vi.fn()

    await expect(shareSocialPoster(complete, { render: async () => blob, download, canShare, share })).resolves.toBe('shared')
    expect(canShare).toHaveBeenCalledWith(expect.objectContaining({ files: expect.any(Array) }))
    expect(share).toHaveBeenCalledOnce()
    expect(download).not.toHaveBeenCalled()
  })

  it('downloads after a non-abort sharing failure but not after cancellation', async () => {
    const download = vi.fn()

    await expect(shareSocialPoster(complete, { render: async () => blob, download, canShare: () => true, share: async () => { throw new Error('share failed') } })).resolves.toBe('downloaded')
    await expect(shareSocialPoster(complete, { render: async () => blob, download, canShare: () => true, share: async () => { throw new DOMException('cancelled', 'AbortError') } })).resolves.toBe('cancelled')
    expect(download).toHaveBeenCalledTimes(1)
  })
})
