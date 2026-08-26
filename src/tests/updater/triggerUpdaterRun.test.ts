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

import { runWithClear } from '../../server/updater/index.ts'
import { triggerUpdaterRun } from '../../server/updater/manualRun.ts'
import { createUpdaterRun, getRunningUpdaterRun } from '../../server/util/dbActions.ts'

const runRow = (runtype: 'full' | 'courses') => ({
  id: 1,
  status: 'running' as const,
  runtype,
  triggeredBy: 'manual run',
  error: null,
  startedAt: new Date(),
  finishedAt: null,
})

describe('triggerUpdaterRun', () => {
  beforeEach(() => {
    vi.mocked(getRunningUpdaterRun).mockReset()
    vi.mocked(createUpdaterRun).mockReset()
    vi.mocked(runWithClear).mockReset().mockResolvedValue(undefined)
  })

  it('starts a courses-only run', async () => {
    vi.mocked(getRunningUpdaterRun).mockResolvedValue(null)
    vi.mocked(createUpdaterRun).mockResolvedValue(runRow('courses'))

    const result = await triggerUpdaterRun('manual run', 'courses')

    expect(result?.runtype).toBe('courses')
    expect(createUpdaterRun).toHaveBeenCalledWith('manual run', 'courses')
    expect(runWithClear).toHaveBeenCalledWith(true, 'courses')
  })

  it('starts a full run', async () => {
    vi.mocked(getRunningUpdaterRun).mockResolvedValue(null)
    vi.mocked(createUpdaterRun).mockResolvedValue(runRow('full'))

    const result = await triggerUpdaterRun('manual run', 'full')

    expect(result?.runtype).toBe('full')
    expect(createUpdaterRun).toHaveBeenCalledWith('manual run', 'full')
    expect(runWithClear).toHaveBeenCalledWith(true, 'full')
  })

  it('defaults to a full run', async () => {
    vi.mocked(getRunningUpdaterRun).mockResolvedValue(null)
    vi.mocked(createUpdaterRun).mockResolvedValue(runRow('full'))

    await triggerUpdaterRun('cron')

    expect(createUpdaterRun).toHaveBeenCalledWith('cron', 'full')
    expect(runWithClear).toHaveBeenCalledWith(true, 'full')
  })

  it('does not start a run when one is already in progress', async () => {
    vi.mocked(getRunningUpdaterRun).mockResolvedValue(runRow('full') as never)

    const result = await triggerUpdaterRun('manual run', 'courses')

    expect(result).toBeNull()
    expect(createUpdaterRun).not.toHaveBeenCalled()
    expect(runWithClear).not.toHaveBeenCalled()
  })
})
