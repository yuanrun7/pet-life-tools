import { describe, expect, it } from 'vitest'

import source from '../../../public/sw.js?raw'

type Listener = (event: { waitUntil: (promise: Promise<unknown>) => void }) => void

async function loadWorker(caches: { open: () => Promise<{ addAll: (urls: string[]) => Promise<void> }>; keys: () => Promise<string[]>; delete: (name: string) => Promise<boolean> }) {
  const listeners = new Map<string, Listener>()
  const self = {
    addEventListener: (type: string, listener: Listener) => listeners.set(type, listener),
    clients: { claim: () => Promise.resolve() },
    location: { origin: 'https://example.test' },
  }

  new Function('self', 'caches', source)(self, caches)
  return listeners
}

function captureWaitUntil() {
  let pending: Promise<unknown> | undefined
  return {
    event: { waitUntil: (promise: Promise<unknown>) => { pending = promise } },
    promise: () => pending,
  }
}

describe('service worker cache lifecycle', () => {
  it('rejects installation when shell precaching fails', async () => {
    const listeners = await loadWorker({
      open: async () => ({ addAll: async () => Promise.reject(new Error('offline')) }),
      keys: async () => [],
      delete: async () => true,
    })
    const capture = captureWaitUntil()

    listeners.get('install')?.(capture.event)

    await expect(capture.promise()).rejects.toThrow('offline')
  })

  it('deletes only older pet-toolkit caches during activation', async () => {
    const deleted: string[] = []
    const listeners = await loadWorker({
      open: async () => ({ addAll: async () => undefined }),
      keys: async () => ['pet-toolkit-shell-v0', 'pet-toolkit-shell-v1', 'other-app-v1'],
      delete: async (name) => { deleted.push(name); return true },
    })
    const capture = captureWaitUntil()

    listeners.get('activate')?.(capture.event)
    await capture.promise()

    expect(deleted).toEqual(['pet-toolkit-shell-v0'])
  })
})
