import type { UpdaterRun as UpdaterRunType, UpdaterRunKind } from '../../../common/types.ts'
import UpdaterRun from '../../db/models/updaterRun.ts'

export async function getRunningUpdaterRun() {
  return await UpdaterRun.findOne({ where: { status: 'running' } })
}

export async function createUpdaterRun(triggeredBy: string, runtype: UpdaterRunKind): Promise<UpdaterRunType> {
  const startedAt = new Date()
  const run = await UpdaterRun.create({ status: 'running', runtype, triggeredBy, startedAt })
  return {
    id: run.id,
    status: 'running',
    runtype,
    triggeredBy: run.triggeredBy ?? null,
    error: run.error ?? null,
    startedAt,
    finishedAt: null,
  }
}

export async function failInterruptedUpdaterRuns(): Promise<number> {
  const [affected] = await UpdaterRun.update(
    { status: 'failed', finishedAt: new Date(), error: 'Interrupted by pod restart' },
    { where: { status: 'running' } }
  )
  return affected
}

export async function finishUpdaterRun(id: number, status: 'success' | 'failed', error?: string) {
  await UpdaterRun.update({ status, finishedAt: new Date(), error: error ?? null }, { where: { id } })
}

export async function getUpdaterRuns(limit = 20): Promise<UpdaterRunType[]> {
  const runs = await UpdaterRun.findAll({
    order: [['startedAt', 'DESC']],
    limit,
    raw: true,
  })
  return runs.map(r => ({
    id: r.id,
    status: r.status as UpdaterRunType['status'],
    runtype: r.runtype as UpdaterRunKind,
    triggeredBy: r.triggeredBy ?? null,
    error: r.error ?? null,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt ?? null,
  }))
}
