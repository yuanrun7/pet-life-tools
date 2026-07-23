import { afterEach, expect, it, vi } from 'vitest'

import { scheduleObjectUrlRelease } from './download'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('releases a Blob URL after the click stack has completed', () => {
  vi.useFakeTimers()
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

  scheduleObjectUrlRelease('blob:test-calendar')

  expect(revoke).not.toHaveBeenCalled()
  vi.runAllTimers()
  expect(revoke).toHaveBeenCalledWith('blob:test-calendar')
})
