import { describe, expect, it } from 'vitest'

import { pageMeta, resolvePage } from './pageMeta'

describe('resolvePage', () => {
  it.each([
    ['/', 'home'],
    ['/schedule/', 'schedule'],
    ['/cost/', 'cost'],
    ['/lost-pet/', 'lost-pet'],
    ['/records/', 'records'],
    ['/guide/', 'guide'],
  ] as const)('resolves %s to %s', (pathname, expectedPage) => {
    expect(resolvePage(pathname)).toBe(expectedPage)
  })

  it('falls back to home for an unknown path', () => {
    expect(resolvePage('/not-a-tool/')).toBe('home')
  })
})

describe('pageMeta', () => {
  it('provides unique SEO metadata and matching canonical paths for every page', () => {
    expect(Object.values(pageMeta)).toHaveLength(6)

    for (const [key, meta] of Object.entries(pageMeta)) {
      expect(meta.title).toBeTruthy()
      expect(meta.description).toBeTruthy()
      expect(meta.canonical).toBe(key === 'home' ? '/' : `/${key}/`)
      expect(meta.faq).toHaveLength(2)
    }
  })
})
