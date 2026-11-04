import { afterEach, describe, expect, it, vi } from 'vitest'
import { startJobApplyRedirect } from './jobApplyRedirect'

describe('startJobApplyRedirect', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('redirects after the countdown duration', () => {
    vi.useFakeTimers()
    const redirect = vi.fn()
    const onTick = vi.fn()

    startJobApplyRedirect(redirect, onTick)
    expect(onTick).toHaveBeenLastCalledWith(10)
    expect(redirect).not.toHaveBeenCalled()

    vi.advanceTimersByTime(9000)
    expect(redirect).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(redirect).toHaveBeenCalledTimes(1)
    expect(onTick).toHaveBeenLastCalledWith(0)
  })

  it('can be cancelled before redirecting', () => {
    vi.useFakeTimers()
    const redirect = vi.fn()
    const cancel = startJobApplyRedirect(redirect, vi.fn())

    vi.advanceTimersByTime(4000)
    cancel()
    vi.advanceTimersByTime(10000)

    expect(redirect).not.toHaveBeenCalled()
  })
})
