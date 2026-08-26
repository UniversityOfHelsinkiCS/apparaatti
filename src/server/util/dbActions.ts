import { Op } from 'sequelize'

import type {
  RecommendationMetadata,
  UpdaterRun as UpdaterRunType,
  UpdaterRunKind,
  UrnMatchMode,
  UserFeedback as UserFeedbackType,
  UserSettings as UserSettingsType,
  UserVisit,
} from '../../common/types.ts'
import CourseAdminReview from '../db/models/CourseAdminReview.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import Filter from '../db/models/filter.ts'
import Organisation from '../db/models/organisation.ts'
import StudyRight from '../db/models/studyRight.ts'
import UpdaterRun from '../db/models/updaterRun.ts'
import User from '../db/models/user.ts'
import UserFeedback from '../db/models/userFeedback.ts'
import UserSettings from '../db/models/userSettings.ts'
import UserVisits from '../db/models/userVisits.ts'

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
      id: groupIds,
    },
    raw: true,
  })
}

export async function userWithId(id: string) {
  return await User.findByPk(id)
}

export async function getUserSettings(userId: string) {
  return await UserSettings.findOne({
    where: { userId },
  })
}

export async function updateUserSettings(userId: string, settings: UserSettingsType) {
  const [userSettings] = await UserSettings.upsert({
    ...settings,
    userId,
  })
  return userSettings
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
  await Promise.all(entries.map(({ id, displayOrder }) => Filter.update({ displayOrder }, { where: { id } })))
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
  return Object.values(customCodeUrns)
    .flat()
    .map(u => u.toLowerCase())
}

// Include: with mode 'or' the Cur must match at least one of the given URN
// substrings, with 'and' it must match every one of them. Exclude: with 'or'
// the Cur is dropped as soon as one exclude substring matches, with 'and' only
// when every exclude substring matches. Empty lists never filter anything.
function curMatchesUrnFilters(
  cur: any,
  includeUrnListLower: string[],
  includeMode: UrnMatchMode,
  excludeUrnListLower: string[],
  excludeMode: UrnMatchMode
): boolean {
  const urns = getCurUrnsLowercase(cur)
  const matches = (needle: string) => urns.some(u => u.includes(needle))

  if (includeUrnListLower.length > 0) {
    const included = includeMode === 'and' ? includeUrnListLower.every(matches) : includeUrnListLower.some(matches)
    if (!included) return false
  }
  if (excludeUrnListLower.length > 0) {
    const excluded = excludeMode === 'and' ? excludeUrnListLower.every(matches) : excludeUrnListLower.some(matches)
    if (excluded) return false
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
    include: [
      {
        model: Cu,
        required: true,
        attributes: [],
        where: {
          [Op.or]: excludeCourseCodes.map(code => ({
            courseCode: { [Op.iLike]: `%${code}%` },
          })),
        },
        through: { attributes: [] },
      },
    ],
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
  includeUrnListLower: string[],
  includeMode: UrnMatchMode,
  excludeUrnListLower: string[],
  excludeMode: UrnMatchMode,
  reviewStatus: string | undefined,
  page: number,
  limit: number,
  offset: number
) {
  const allCurs = await Cur.findAll({
    where: curWhere,
    include: includeOptions,
    order: [['name', 'ASC']],
    subQuery: false,
  })

  const filtered = allCurs.filter(cur =>
    curMatchesUrnFilters(cur, includeUrnListLower, includeMode, excludeUrnListLower, excludeMode)
  )

  const filteredWithReviews = filterCoursesByReviewStatus(await populateWithReviews(filtered), reviewStatus)
  const total = filteredWithReviews.length
  const paginatedCourses = filteredWithReviews.slice(offset, offset + limit)
  return {
    courses: paginatedCourses,
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
  /** Comma-separated URN substrings; Curs are kept per `urnMode`. */
  urnSearch?: string
  /** 'or' (default) keeps Curs matching any `urnSearch` substring, 'and' requires every one. */
  urnMode?: UrnMatchMode
  /** Comma-separated URN substrings; Curs are excluded per `excludeUrnsMode`. */
  excludeUrns?: string
  /** 'or' (default) excludes Curs matching any substring, 'and' only those matching every one. */
  excludeUrnsMode?: UrnMatchMode

  // --- Course code filters (operate on linked Cu.courseCode) ---
  /** Substring against `Cu.courseCode`. AND-combined with the hard 'KK-%' prefix. */
  courseCodeSearch?: string
  /** Comma-separated course-code substrings; Curs whose ANY linked Cu matches are excluded. */
  excludeCourseCodes?: string

  /** Limit results to reviewed or not-reviewed courses. */
  reviewStatus?: string

  // --- Date filters: Curs whose [startDate, endDate] range fits entirely inside [dateFrom, dateTo] ---
  /** ISO date string; excludes Curs that start before this date. */
  dateFrom?: string
  /** ISO date string; excludes Curs that end after this date (end of day). */
  dateTo?: string
}

function endOfDay(dateStr: string): Date {
  const d = new Date(dateStr)
  d.setUTCHours(23, 59, 59, 999)
  return d
}

function filterCoursesByReviewStatus(courses: any[], reviewStatus?: string) {
  if (reviewStatus === 'reviewed') {
    return courses.filter(course => course.reviewState?.reviewed === 'yes')
  }

  if (reviewStatus === 'not-reviewed') {
    return courses.filter(course => !course.reviewState || course.reviewState.reviewed !== 'yes')
  }

  return courses
}

async function populateWithReviews(curs: Cur[]) {
  const cursWithReviews = await Promise.all(
    curs.map(async cur => {
      const plainCur = typeof (cur as any).get === 'function' ? (cur as any).get({ plain: true }) : cur

      const reviewState = await getCourseAdminReviewByCurId(plainCur.id)

      return {
        ...plainCur,
        reviewState,
      }
    })
  )
  return cursWithReviews
}

export async function searchCoursesWithPagination(filters: CourseSearchFilters, page: number, limit: number) {
  const {
    nameSearch,
    urnSearch,
    urnMode,
    excludeUrns,
    excludeUrnsMode,
    courseCodeSearch,
    excludeCourseCodes,
    reviewStatus,
    dateFrom,
    dateTo,
  } = filters
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

  // Containment check: the course's [startDate, endDate] range must fit entirely
  // inside the searched [dateFrom, dateTo] range. Bounds are inclusive.
  if (dateFrom) {
    curWhere.startDate = { [Op.gte]: new Date(dateFrom) }
  }
  if (dateTo) {
    curWhere.endDate = { [Op.lte]: endOfDay(dateTo) }
  }

  // Hard filter: only KK- coded courses are surfaced in the admin list.
  // Cu.courseCode must start with 'KK-'. AND-combine with any user-supplied substring.
  const cuWhere: any = {
    courseCode: courseCodeSearch
      ? { [Op.and]: [{ [Op.iLike]: 'KK-%' }, { [Op.iLike]: `%${courseCodeSearch}%` }] }
      : { [Op.iLike]: 'KK-%' },
  }

  const includeUrnList = parseCsvList(urnSearch).map(s => s.toLowerCase())
  const excludeUrnList = parseCsvList(excludeUrns).map(s => s.toLowerCase())
  const excludeCourseCodeList = parseCsvList(excludeCourseCodes)

  const excludedCurIds = await findCurIdsToExcludeByCourseCode(excludeCourseCodeList)
  if (excludedCurIds.length > 0) {
    curWhere.id = { [Op.notIn]: excludedCurIds }
  }

  const includeOptions: any[] = [
    {
      model: Cu,
      required: true,
      attributes: ['id', 'courseCode', 'name'],
      where: cuWhere,
      through: { attributes: [] }, // Don't include join table attributes
    },
  ]

  const needsJsFiltering =
    includeUrnList.length > 0 ||
    excludeUrnList.length > 0 ||
    reviewStatus === 'reviewed' ||
    reviewStatus === 'not-reviewed'

  if (needsJsFiltering) {
    const jsFilteredResult = await paginateCursWithJsUrnFilter(
      curWhere,
      includeOptions,
      includeUrnList,
      urnMode ?? 'or',
      excludeUrnList,
      excludeUrnsMode ?? 'or',
      reviewStatus,
      page,
      limit,
      offset
    )
    return jsFilteredResult
  } else {
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

    //populating the courses with the reviews
    const resultsWithReviews = await populateWithReviews(results)

    return {
      courses: resultsWithReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}

export async function createUserVisitsEntry(visitorHashHex: string, date: Date, organisationCode: string | null) {
  // Normalize to UTC hour start
  const startHour = new Date(date)
  startHour.setUTCHours(startHour.getUTCHours(), 0, 0, 0)

  const entry: UserVisit = {
    visitorHashHex,
    date: startHour,
    organisationCode,
  }

  // findOrCreate to avoid duplicates when multiple requests arrive
  await UserVisits.findOrCreate({
    where: { visitorHashHex: entry.visitorHashHex, date: entry.date },
    defaults: entry,
  })
}

export async function getUserVisitsByUser(visitorHashHex: string, start: Date, end: Date) {
  const visits = await UserVisits.findAll({
    where: {
      visitorHashHex,
      date: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    raw: true,
  })

  return visits
}

// returns user visits in db grouped by the user
export async function getUserVisits(start: Date, end: Date) {
  const visits = await UserVisits.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    raw: true,
  })

  return visits
}

export async function getAllUserVisits(limit: number) {
  const visits = await UserVisits.findAll({
    order: [['date', 'DESC']],
    limit,
    raw: true,
  })

  return visits
}

export async function createUserFeedbackEntry(
  textFeedback: string,
  stars: number,
  date: Date,
  recommendationMetadata?: RecommendationMetadata,
  appVersion?: string,
  email?: string
) {
  await UserFeedback.create({
    textFeedback,
    stars,
    recommendationMetadata: recommendationMetadata ?? null,
    appVersion: appVersion ?? null,
    email: email ?? null,
    date,
  })
}

export async function getUserFeedbackEntries(start: Date, end: Date): Promise<UserFeedbackType[]> {
  return (await UserFeedback.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    order: [['date', 'DESC']],
    raw: true,
  })) as UserFeedbackType[]
}

export async function deleteUserFeedbackByIds(ids: number[]): Promise<number> {
  return await UserFeedback.destroy({ where: { id: { [Op.in]: ids } } })
}

export async function deleteUserFeedbackOlderThan(before: Date): Promise<number> {
  return await UserFeedback.destroy({ where: { date: { [Op.lt]: before } } })
}

export async function createOrUpdateCourseAdminReviewEntry(curId: string, reviewed: string, comment?: string) {
  const existingReview = await CourseAdminReview.findOne({
    where: { curId },
    order: [['updatedAt', 'DESC']],
  })

  if (existingReview) {
    existingReview.reviewed = reviewed
    existingReview.comment = comment ?? ''
    await existingReview.save()
    return existingReview.get({ plain: true })
  }

  const createdReview = await CourseAdminReview.create({
    curId,
    reviewed,
    comment: comment ?? '',
  })

  return createdReview.get({ plain: true })
}

export async function getCourseAdminReviewByCurId(curId: string) {
  return await CourseAdminReview.findOne({
    where: { curId },
    order: [['updatedAt', 'DESC']],
    raw: true,
  })
}

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
