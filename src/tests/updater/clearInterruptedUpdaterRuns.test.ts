import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock to prevent database initialization when importing manualRun.ts
vi.mock('../../server/util/dbActions.ts', () => ({
  createUpdaterRun: vi.fn(),
  failInterruptedUpdaterRuns: vi.fn(),
  finishUpdaterRun: vi.fn(),
  getRunningUpdaterRun: vi.fn(),
}))

vi.mock('../../server/updater/index.ts', () => ({
  runWithClear: vi.fn(),
}))

vi.mock('../../server/util/logger.ts', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}))

import { clearInterruptedUpdaterRuns } from '../../server/updater/manualRun.ts'
import { failInterruptedUpdaterRuns } from '../../server/util/dbActions.ts'
import logger from '../../server/util/logger.ts'

describe('clearInterruptedUpdaterRuns', () => {
  beforeEach(() => {
    vi.mocked(failInterruptedUpdaterRuns).mockReset()
    vi.mocked(logger.info).mockReset()
  })

  it('marks leftover running rows as failed and logs how many', async () => {
    vi.mocked(failInterruptedUpdaterRuns).mockResolvedValue(2)

    const cleared = await clearInterruptedUpdaterRuns()

    expect(cleared).toBe(2)
    expect(failInterruptedUpdaterRuns).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledTimes(1)
    expect(vi.mocked(logger.info).mock.calls[0][0]).toContain('2')
  })

  it('does not log when there is nothing to clear', async () => {
    vi.mocked(failInterruptedUpdaterRuns).mockResolvedValue(0)

    const cleared = await clearInterruptedUpdaterRuns()

    expect(cleared).toBe(0)
    expect(failInterruptedUpdaterRuns).toHaveBeenCalledTimes(1)
    expect(logger.info).not.toHaveBeenCalled()
  })
})
