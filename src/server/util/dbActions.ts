import { Op } from 'sequelize'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import Filter from '../db/models/filter.ts'
import Organisation from '../db/models/organisation.ts'
import StudyRight from '../db/models/studyRight.ts'
import User from '../db/models/user.ts'
import UserFeedback from '../db/models/userFeedback.ts'
import UserVisits from '../db/models/userVisits.ts'
import type { RecommendationMetadata, UserFeedback as UserFeedbackType, UserVisit } from '../../common/types.ts'

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

function parseCsvList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function getCurUrnsLowercase(cur: any): string[] {
  const customCodeUrns = cur.customCodeUrns as Record<string, string[]> | null
  if (!customCodeUrns) return []
  return Object.values(customCodeUrns).flat().map(u => u.toLowerCase())
}

function curMatchesUrnFilters(
  cur: any,
  urnSearchLower: string | undefined,
  excludeUrnListLower: string[]
): boolean {
  const urns = getCurUrnsLowercase(cur)
  if (urnSearchLower && !urns.some(u => u.includes(urnSearchLower))) {
    return false
  }
  if (excludeUrnListLower.some(ex => urns.some(u => u.includes(ex)))) {
    return false
  }
  return true
}

// Returns the ids of Curs that have ANY linked Cu whose courseCode matches
// (case-insensitive substring) any of the given exclude codes. These Curs
// should be removed from the main query entirely; filtering inside the include
// would only hide the matching Cu rows while leaving the Cur reachable via
// its other Cus.
async function findCurIdsToExcludeByCourseCode(excludeCourseCodes: string[]): Promise<string[]> {
  if (excludeCourseCodes.length === 0) return []
  const excludedCurs = await Cur.findAll({
    attributes: ['id'],
    include: [{
      model: Cu,
      required: true,
      attributes: [],
      where: {
        [Op.or]: excludeCourseCodes.map(code => ({
          courseCode: { [Op.iLike]: `%${code}%` }
        }))
      },
      through: { attributes: [] }
    }],
    raw: true,
  })
  return excludedCurs.map((c: any) => c.id)
}

// Fetches all Curs matching the SQL-side filters, then narrows by JSONB
// customCodeUrns in JavaScript (URN search and/or URN excludes), and finally
// paginates. Required because Postgres JSONB array contents can't be filtered
// efficiently with the existing Sequelize where-clause shape.
async function paginateCursWithJsUrnFilter(
  curWhere: any,
  includeOptions: any[],
  urnSearch: string | undefined,
  excludeUrnListLower: string[],
  page: number,
  limit: number,
  offset: number,
) {
  const allCurs = await Cur.findAll({
    where: curWhere,
    include: includeOptions,
    order: [['name', 'ASC']],
    subQuery: false,
  })

  const urnSearchLower = urnSearch?.toLowerCase()
  const filtered = allCurs.filter(cur =>
    curMatchesUrnFilters(cur, urnSearchLower, excludeUrnListLower)
  )

  const total = filtered.length
  return {
    courses: filtered.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Filters for the admin courses search.
 *
 * URN-related fields operate on the JSONB `customCodeUrns` column of Cur, and
 * are matched as case-insensitive substrings against the URN strings.
 * Course-code-related fields operate on the linked `Cu.courseCode`.
 */
export interface CourseSearchFilters {
  /** Case-insensitive substring against `Cur.name.{fi,en,sv}`. */
  nameSearch?: string

  // --- URN filters (operate on Cur.customCodeUrns JSONB) ---
  /** Include only Curs whose `customCodeUrns` contains this substring. */
  urnSearch?: string
  /** Comma-separated URN substrings; Curs matching ANY are excluded. */
  excludeUrns?: string

  // --- Course code filters (operate on linked Cu.courseCode) ---
  /** Substring against `Cu.courseCode`. AND-combined with the hard 'KK-%' prefix. */
  courseCodeSearch?: string
  /** Comma-separated course-code substrings; Curs whose ANY linked Cu matches are excluded. */
  excludeCourseCodes?: string
}

export async function searchCoursesWithPagination(
  filters: CourseSearchFilters,
  page: number,
  limit: number
) {
  const { nameSearch, urnSearch, excludeUrns, courseCodeSearch, excludeCourseCodes } = filters
  const offset = (page - 1) * limit

  // Build the where clause for course realizations (name search)
  const curWhere: any = {}

  if (nameSearch) {
    curWhere[Op.or] = [
      { 'name.fi': { [Op.iLike]: `%${nameSearch}%` } },
      { 'name.en': { [Op.iLike]: `%${nameSearch}%` } },
      { 'name.sv': { [Op.iLike]: `%${nameSearch}%` } },
    ]
  }

  // Hard filter: only KK- coded courses are surfaced in the admin list.
  // Cu.courseCode must start with 'KK-'. AND-combine with any user-supplied substring.
  const cuWhere: any = {
    courseCode: courseCodeSearch
      ? { [Op.and]: [{ [Op.iLike]: 'KK-%' }, { [Op.iLike]: `%${courseCodeSearch}%` }] }
      : { [Op.iLike]: 'KK-%' }
  }

  const excludeUrnList = parseCsvList(excludeUrns).map(s => s.toLowerCase())
  const excludeCourseCodeList = parseCsvList(excludeCourseCodes)

  const excludedCurIds = await findCurIdsToExcludeByCourseCode(excludeCourseCodeList)
  if (excludedCurIds.length > 0) {
    curWhere.id = { [Op.notIn]: excludedCurIds }
  }

  const includeOptions: any[] = [{
    model: Cu,
    required: true,
    where: cuWhere,
    through: { attributes: [] } // Don't include join table attributes
  }]

  const needsJsUrnFilter = !!urnSearch || excludeUrnList.length > 0

  if (needsJsUrnFilter) {
    const jsFilteredResult = await paginateCursWithJsUrnFilter(
      curWhere,
      includeOptions,
      urnSearch,
      excludeUrnList,
      page,
      limit,
      offset,
    )
    return jsFilteredResult
  }

  // No JS-side filtering required - use regular paginated query
  const { rows: results, count: total } = await Cur.findAndCountAll({
    where: curWhere,
    include: includeOptions,
    limit,
    offset,
    order: [['name', 'ASC']],
    distinct: true,
    subQuery: false,
  })

  return {
    courses: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}


export async function createUserVisitsEntry(visitorHashHex: string, date: Date){
  
  const entry: UserVisit = {
    visitorHashHex,
    date,
  }
  await UserVisits.create(entry)

}



export async function getUserVisitsByUser(visitorHashHex, start, end){
  const visits = await UserVisits.findAll({
    where: {
      visitorHashHex: visitorHashHex,
      date: {
        [Op.gte]: start,
        [Op.lt]: end
      }
    },
    raw: true
  })

  return visits
}

export async function getUserVisits(start: Date, end: Date){
  const visits = await UserVisits.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lt]: end
      }
    },
    raw: true
  })

  return visits

}

export async function createUserFeedbackEntry(
  textFeedback: string,
  stars: number,
  date: Date,
  recommendationMetadata?: RecommendationMetadata
) {
  await UserFeedback.create({
    textFeedback,
    stars,
    recommendationMetadata: recommendationMetadata ?? null,
    date,
  })
}

export async function getUserFeedbackEntries(start: Date, end: Date): Promise<UserFeedbackType[]> {
  return await UserFeedback.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    order: [['date', 'DESC']],
    raw: true,
  }) as UserFeedbackType[]
}
