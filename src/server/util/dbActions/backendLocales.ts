import type { BackendLocaleConditions, BackendLocaleKey as BackendLocaleKeyType } from '../../../common/types.ts'
import BackendLocaleKey from '../../db/models/backendLocaleKey.ts'
import BackendLocaleValue from '../../db/models/backendLocaleValue.ts'

export async function allBackendLocaleKeys(): Promise<BackendLocaleKeyType[]> {
  const keys = await BackendLocaleKey.findAll({
    include: [{ model: BackendLocaleValue, as: 'values' }],
    order: [
      ['key', 'ASC'],
      [{ model: BackendLocaleValue, as: 'values' }, 'id', 'ASC'],
    ],
  })
  return keys.map(key => key.toJSON() as BackendLocaleKeyType)
}

export async function backendLocaleKeyByKey(key: string): Promise<BackendLocaleKeyType | null> {
  const row = await BackendLocaleKey.findOne({
    where: { key },
    include: [{ model: BackendLocaleValue, as: 'values' }],
  })
  if (!row) return null
  return row.toJSON() as BackendLocaleKeyType
}

export async function createBackendLocaleKey(data: object) {
  return await BackendLocaleKey.create(data as any)
}

export async function updateBackendLocaleKeyDescription(key: string, description: string): Promise<number> {
  const [count] = await BackendLocaleKey.update({ description }, { where: { key } })
  return count
}

export async function deleteBackendLocaleKey(key: string): Promise<number> {
  return await BackendLocaleKey.destroy({ where: { key } })
}

export async function createBackendLocaleValue(key: string, data: object) {
  return await BackendLocaleValue.create({ ...(data as any), key })
}

export async function backendLocaleValueByConditions(
  key: string,
  conditions: BackendLocaleConditions
): Promise<any | null> {
  return await BackendLocaleValue.findOne({ where: { key, ...conditions }, raw: true })
}

export async function updateBackendLocaleValueById(id: number, data: object): Promise<number> {
  const [count] = await BackendLocaleValue.update(data as any, { where: { id } })
  return count
}

export async function deleteBackendLocaleValueById(id: number): Promise<number> {
  return await BackendLocaleValue.destroy({ where: { id } })
}
