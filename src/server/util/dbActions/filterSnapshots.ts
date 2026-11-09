import { mergeFilterMutations } from '../../../common/filterWordings.ts'
import type {
  FilterBase,
  FilterConfig,
  FilterMutations,
  FilterSnapshotMeta,
  FilterSnapshotPayload,
} from '../../../common/types.ts'
import { sequelize } from '../../db/connection.ts'
import Filter from '../../db/models/filter.ts'
import FilterSnapshot from '../../db/models/filterSnapshot.ts'
import { orderedFilterConfigs } from './filterConfigs.ts'

export async function publishedFilterPayload(): Promise<FilterSnapshotPayload> {
  return { exportedAt: new Date().toISOString(), filters: (await orderedFilterConfigs()) as FilterConfig[] }
}

export async function filterSnapshotById(id: number): Promise<FilterSnapshotPayload | null> {
  const row = await FilterSnapshot.findByPk(id)
  return row ? ((row.get('payload') as FilterSnapshotPayload) ?? null) : null
}

export async function basePayload(base: FilterBase): Promise<FilterSnapshotPayload | null> {
  if (base.kind === 'published') return await publishedFilterPayload()
  return await filterSnapshotById(base.id)
}

export async function mergedPayload(
  base: FilterBase,
  mutations: FilterMutations
): Promise<FilterSnapshotPayload | null> {
  const payload = await basePayload(base)
  return payload ? mergeFilterMutations(payload, mutations) : null
}

export async function allFilterSnapshots(): Promise<FilterSnapshotMeta[]> {
  const rows = await FilterSnapshot.findAll({
    attributes: ['id', 'name', 'description', 'createdAt', 'isActive'],
    order: [['createdAt', 'DESC']],
    raw: true,
  })
  return rows as unknown as FilterSnapshotMeta[]
}

export async function createFilterSnapshotFromPayload(
  name: string,
  description: string | null,
  payload: FilterSnapshotPayload
): Promise<FilterSnapshotMeta> {
  const created = await FilterSnapshot.create({ name, description, payload } as any)
  return created.toJSON() as FilterSnapshotMeta
}

export async function applyMutationsToSnapshot(id: number, mutations: FilterMutations): Promise<boolean> {
  return await sequelize.transaction(async transaction => {
    const row = await FilterSnapshot.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE })
    if (!row) return false

    const payload = (row.get('payload') as FilterSnapshotPayload) ?? null
    if (!payload) return false

    await row.update({ payload: mergeFilterMutations(payload, mutations), isActive: false } as any, { transaction })
    return true
  })
}

export async function updateFilterSnapshotMeta(id: number, name: string, description: string | null): Promise<number> {
  const [count] = await FilterSnapshot.update({ name, description } as any, { where: { id } })
  return count
}

export async function overwriteFilterSnapshotPayload(id: number, payload: FilterSnapshotPayload): Promise<number> {
  const [count] = await FilterSnapshot.update({ payload, isActive: false } as any, { where: { id } })
  return count
}

export async function deleteFilterSnapshotById(id: number): Promise<number> {
  return await FilterSnapshot.destroy({ where: { id } })
}

export async function publishFilterPayload(
  payload: FilterSnapshotPayload,
  activeSnapshotId: number | null
): Promise<{ filters: number }> {
  return await sequelize.transaction(async transaction => {
    for (const config of payload.filters) {
      const [row, created] = await Filter.findOrCreate({
        where: { id: config.id },
        defaults: config as any,
        transaction,
      })
      if (!created) await row.update(config as any, { transaction })
    }

    await FilterSnapshot.update({ isActive: false } as any, { where: { isActive: true }, transaction })
    if (activeSnapshotId !== null) {
      await FilterSnapshot.update({ isActive: true } as any, { where: { id: activeSnapshotId }, transaction })
    }

    return { filters: payload.filters.length }
  })
}
