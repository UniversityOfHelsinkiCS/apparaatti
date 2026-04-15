import { Op } from 'sequelize'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import Filter from '../db/models/filter.ts'
import Organisation from '../db/models/organisation.ts'
import StudyRight from '../db/models/studyRight.ts'
import User from '../db/models/user.ts'

export async function cuWithCourseCodeOf(courseCodeStrings: string[]) {
  return await Cu.findAll({
    where: {
      courseCode: courseCodeStrings,
    },
  })
}

export async function curWithIdOf(wantedIds: string[]) {
  return await Cur.findAll({
    where: {
      id: wantedIds,
    },
    raw: true,
  })
}

export async function curcusWithUnitIdOf(courseUnitIds: string[]) {
  return await CurCu.findAll({
    where: {
      cuId: courseUnitIds,
    },
    raw: true,
  })
}

export async function organisationWithGroupIdOf(groupIds: string[]) {
  return await Organisation.findAll({
    where: {
      id: groupIds
    },
    raw: true,
  })
}

export async function userWithId(id: string) {
  return await User.findByPk(id)
}

export async function usersWithWhere(where: Record<string, any>, limit: number) {
  return await User.findAll({
    where,
    limit,
    raw: true,
  })
}

export async function orderedFilterConfigs(): Promise<any[]> {
  return await Filter.findAll({
    order: [['display_order', 'ASC']],
    raw: true,
  })
}

export async function enabledOrderedFilterConfigs(): Promise<any[]> {
  return await Filter.findAll({
    where: { enabled: true },
    order: [['display_order', 'ASC']],
    raw: true,
  })
}

export async function filterConfigWithId(id: string): Promise<any | null> {
  return await Filter.findByPk(id, { raw: true })
}

export async function createFilterConfig(filterConfig: object) {
  return await Filter.create(filterConfig as any)
}

export async function updateFilterConfigById(id: string, filterConfig: object): Promise<any | null> {
  await Filter.update(filterConfig as any, { where: { id } })
  return await Filter.findByPk(id)
}

export async function disableFilterConfigById(id: string): Promise<any | null> {
  await Filter.update({ enabled: false }, { where: { id } })
  return await Filter.findByPk(id)
}

export async function reorderFilterConfigs(entries: Array<{ id: string; displayOrder: number }>) {
  await Promise.all(
    entries.map(({ id, displayOrder }) =>
      Filter.update({ displayOrder }, { where: { id } })
    )
  )
}

export async function organisationsWithSupportedCodes(codes: string[]) {
  return await Organisation.findAll({
    where: {
      code: { [Op.in]: codes },
    },
    raw: true,
  })
}

export async function allOrganisations() {
  return await Organisation.findAll({ raw: true })
}

export async function organisationsWithIds(ids: string[]) {
  return await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    where: {
      id: ids,
    },
    raw: true,
  })
}

export async function studyRightsForPersonId(personId: string) {
  return await StudyRight.findAll({
    where: {
      personId,
    },
    order: [['modificationOrdinal', 'DESC']],
    raw: true,
  })
}

export async function allCurs() {
  return await Cur.findAll({})
}

export async function allCursRaw() {
  return await Cur.findAll({ raw: true })
}

export async function cursWithWhereRaw(where: Record<string, any>) {
  return await Cur.findAll(({ where, raw: true } as any))
}

export async function allCurCusRaw() {
  return await CurCu.findAll({ raw: true })
}

export async function allCurCus() {
  return await CurCu.findAll()
}

export async function cusWithIds(ids: string[]) {
  return await Cu.findAll({
    where: { id: ids },
    raw: true,
  })
}

export async function cusWithWhere(where: Record<string, any>) {
  return await Cu.findAll(({ where } as any))
}
