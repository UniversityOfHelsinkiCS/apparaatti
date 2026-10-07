import Cu from '../../db/models/cu.ts'
import Cur from '../../db/models/cur.ts'
import CurCu from '../../db/models/curCu.ts'

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

export async function allCurs() {
  return await Cur.findAll({})
}

export async function allCursRaw() {
  return await Cur.findAll({ raw: true })
}

export async function cursWithWhereRaw(where: Record<string, any>) {
  return await Cur.findAll({ where, raw: true } as any)
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
  return await Cu.findAll({ where } as any)
}

export async function countCursForCus(cuIds: string[]): Promise<Map<string, number>> {
  if (cuIds.length === 0) return new Map()
  const links = await CurCu.findAll({ where: { cuId: cuIds }, attributes: ['cuId', 'curId'], raw: true })
  const counts = new Map<string, number>()
  for (const link of links as any[]) {
    counts.set(link.cuId, (counts.get(link.cuId) ?? 0) + 1)
  }
  return counts
}
