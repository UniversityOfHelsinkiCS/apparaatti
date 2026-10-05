import { Op } from 'sequelize'

import type {
  BackendLocaleConditions,
  BackendLocaleKey as BackendLocaleKeyType,
  CourseTag as CourseTagType,
  CourseTagMode,
  CourseUnitGroup,
  CurTagRow,
  CurTagState,
  CuTagRow,
  RecommendationCode as RecommendationCodeType,
  RecommendationCodeRow,
  RecommendationLanguage as RecommendationLanguageType,
  RecommendationMetadata,
  TagPayloadDiff,
  TagSnapshotMeta,
  TagSnapshotPayload,
  UpdaterRun as UpdaterRunType,
  UpdaterRunKind,
  UrnMatchMode,
  UserFeedback as UserFeedbackType,
  UserSettings as UserSettingsType,
  UserVisit,
  VisitStudyData,
} from '../../common/types.ts'
import { sequelize } from '../db/connection.ts'
import BackendLocaleKey from '../db/models/backendLocaleKey.ts'
import BackendLocaleValue from '../db/models/backendLocaleValue.ts'
import CourseAdminReview from '../db/models/CourseAdminReview.ts'
import CourseTag from '../db/models/courseTag.ts'
import Cu from '../db/models/cu.ts'
import CuCourseTag from '../db/models/cuCourseTag.ts'
import Cur from '../db/models/cur.ts'
import CurCourseTag from '../db/models/curCourseTag.ts'
import CurCu from '../db/models/curCu.ts'
import Filter from '../db/models/filter.ts'
import Organisation from '../db/models/organisation.ts'
import PublishedCuCourseTag from '../db/models/publishedCuCourseTag.ts'
import PublishedCurCourseTag from '../db/models/publishedCurCourseTag.ts'
import RecommendationCode from '../db/models/recommendationCode.ts'
import RecommendationLanguage from '../db/models/recommendationLanguage.ts'
import StudyRight from '../db/models/studyRight.ts'
import TagSnapshot from '../db/models/tagSnapshot.ts'
import UpdaterRun from '../db/models/updaterRun.ts'
import User from '../db/models/user.ts'
import UserFeedback from '../db/models/userFeedback.ts'
import UserSettings from '../db/models/userSettings.ts'
import UserVisits from '../db/models/userVisits.ts'
import { diffTagPayloads } from './courseTags.ts'

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

export async function allRecommendationCodes(): Promise<RecommendationCodeType[]> {
  const rows = await RecommendationCode.findAll({
    include: [{ model: RecommendationLanguage, as: 'language' }],
    order: [
      ['organisationCode', 'ASC'],
      ['courseCode', 'ASC'],
    ],
  })
  return rows.map(row => row.toJSON() as RecommendationCodeType)
}

export async function allRecommendationCodeRows(): Promise<RecommendationCodeRow[]> {
  const codes = await allRecommendationCodes()
  return codes.map(code => ({
    organisationCode: code.organisationCode,
    lang: code.language!.lang,
    languageType: code.language!.languageType,
    primaryLanguageSpecification: code.language!.primaryLanguageSpecification,
    courseCode: code.courseCode,
  }))
}

export async function createRecommendationCode(data: object) {
  return await RecommendationCode.create(data as any)
}

export async function updateRecommendationCodeById(id: number, data: object): Promise<number> {
  const [count] = await RecommendationCode.update(data as any, { where: { id } })
  return count
}

export async function deleteRecommendationCodeById(id: number): Promise<number> {
  return await RecommendationCode.destroy({ where: { id } })
}

export async function allRecommendationLanguages(): Promise<RecommendationLanguageType[]> {
  const rows = await RecommendationLanguage.findAll({ order: [['id', 'ASC']] })
  return rows.map(row => row.toJSON() as RecommendationLanguageType)
}

export async function createRecommendationLanguage(data: object) {
  return await RecommendationLanguage.create(data as any)
}

export async function updateRecommendationLanguageById(id: number, data: object): Promise<number> {
  const [count] = await RecommendationLanguage.update(data as any, { where: { id } })
  return count
}

export async function deleteRecommendationLanguageById(id: number): Promise<number> {
  return await RecommendationLanguage.destroy({ where: { id } })
}

export async function countCodesForRecommendationLanguage(languageId: number): Promise<number> {
  return await RecommendationCode.count({ where: { languageId } })
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

function toPlainCur(cur: any) {
  return typeof cur.get === 'function' ? cur.get({ plain: true }) : cur
}

async function populateWithReviews(curs: Cur[]) {
  const plainCurs = curs.map(toPlainCur)
  if (plainCurs.length === 0) return []

  const reviews = await CourseAdminReview.findAll({
    where: { curId: plainCurs.map(cur => cur.id) },
    order: [['updatedAt', 'ASC']],
    raw: true,
  })
  const latestReviewByCurId = new Map(reviews.map((review: any) => [review.curId, review]))

  return plainCurs.map(cur => ({ ...cur, reviewState: latestReviewByCurId.get(cur.id) ?? null }))
}

export interface CourseSearchQuery {
  curWhere: any
  includeOptions: any[]
  includeUrnList: string[]
  urnMode: UrnMatchMode
  excludeUrnList: string[]
  excludeUrnsMode: UrnMatchMode
}

async function buildCourseSearchQuery(filters: CourseSearchFilters): Promise<CourseSearchQuery> {
  const { nameSearch, courseCodeSearch, excludeCourseCodes, dateFrom, dateTo } = filters
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

  const excludedCurIds = await findCurIdsToExcludeByCourseCode(parseCsvList(excludeCourseCodes))
  if (excludedCurIds.length > 0) {
    curWhere.id = { [Op.notIn]: excludedCurIds }
  }

  // Hard filter: only KK- coded courses are surfaced in the admin list.
  // Cu.courseCode must start with 'KK-'. AND-combine with any user-supplied substring.
  const cuWhere: any = {
    courseCode: courseCodeSearch
      ? { [Op.and]: [{ [Op.iLike]: 'KK-%' }, { [Op.iLike]: `%${courseCodeSearch}%` }] }
      : { [Op.iLike]: 'KK-%' },
  }

  return {
    curWhere,
    includeOptions: [
      {
        model: Cu,
        required: true,
        attributes: ['id', 'courseCode', 'name'],
        where: cuWhere,
        through: { attributes: [] },
      },
    ],
    includeUrnList: parseCsvList(filters.urnSearch).map(s => s.toLowerCase()),
    urnMode: filters.urnMode ?? 'or',
    excludeUrnList: parseCsvList(filters.excludeUrns).map(s => s.toLowerCase()),
    excludeUrnsMode: filters.excludeUrnsMode ?? 'or',
  }
}

export async function matchingCurs(filters: CourseSearchFilters) {
  const query = await buildCourseSearchQuery(filters)

  const allCurs = await Cur.findAll({
    where: query.curWhere,
    include: query.includeOptions,
    order: [['name', 'ASC']],
    subQuery: false,
  })

  const filtered = allCurs.filter(cur =>
    curMatchesUrnFilters(cur, query.includeUrnList, query.urnMode, query.excludeUrnList, query.excludeUrnsMode)
  )

  return filterCoursesByReviewStatus(await populateWithReviews(filtered), filters.reviewStatus)
}

export async function matchingCurIds(filters: CourseSearchFilters): Promise<string[]> {
  return (await matchingCurs(filters)).map(cur => cur.id)
}

export async function searchCoursesWithPagination(filters: CourseSearchFilters, page: number, limit: number) {
  const offset = (page - 1) * limit
  const matched = await matchingCurs(filters)
  const total = matched.length

  return {
    courses: matched.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function createUserVisitsEntry(visitorHashHex: string, date: Date, studyData: VisitStudyData) {
  // Normalize to UTC hour start
  const startHour = new Date(date)
  startHour.setUTCHours(startHour.getUTCHours(), 0, 0, 0)

  const entry: UserVisit = {
    visitorHashHex,
    date: startHour,
    ...studyData,
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

export const AUTO_SNAPSHOT_NAME_PREFIX = 'Applied'

export async function allCourseTags(): Promise<CourseTagType[]> {
  const rows = await CourseTag.findAll({ order: [['key', 'ASC']] })
  return rows.map(row => row.toJSON() as CourseTagType)
}

export async function createCourseTag(data: object): Promise<CourseTagType> {
  const created = await CourseTag.create(data as any)
  return created.toJSON() as CourseTagType
}

export async function updateCourseTagById(id: number, data: object): Promise<number> {
  const [count] = await CourseTag.update(data as any, { where: { id } })
  return count
}

export async function deleteCourseTagById(id: number): Promise<number> {
  return await CourseTag.destroy({ where: { id } })
}

async function tagIdsByKey(): Promise<Map<string, number>> {
  const rows = await CourseTag.findAll({ attributes: ['id', 'key'], raw: true })
  return new Map(rows.map((row: any) => [row.key, row.id]))
}

async function cuTagRowsFrom(model: any, cuIds: string[]): Promise<CuTagRow[]> {
  if (cuIds.length === 0) return []
  const rows = await model.findAll({
    where: { cuId: cuIds },
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  return rows.map((row: any) => ({ cuId: row.cuId, tagKey: row.tag.key }))
}

async function curTagRowsFrom(model: any, curIds: string[]): Promise<CurTagRow[]> {
  if (curIds.length === 0) return []
  const rows = await model.findAll({
    where: { curId: curIds },
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  return rows.map((row: any) => ({ curId: row.curId, tagKey: row.tag.key, mode: row.mode as CourseTagMode }))
}

export async function cuTagRowsForCus(cuIds: string[]): Promise<CuTagRow[]> {
  return await cuTagRowsFrom(CuCourseTag, cuIds)
}

export async function curTagRowsForCurs(curIds: string[]): Promise<CurTagRow[]> {
  return await curTagRowsFrom(CurCourseTag, curIds)
}

async function tagStateFrom(curModel: any, cuModel: any, curIds: string[]): Promise<CurTagState> {
  const inheritedByCur = new Map<string, string[]>()
  const rowsByCur = new Map<string, CurTagRow[]>()
  if (curIds.length === 0) return { inheritedByCur, rowsByCur }

  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })
  const cuTags = await cuTagRowsFrom(cuModel, [...new Set(links.map((link: any) => link.cuId))])
  const curTags = await curTagRowsFrom(curModel, curIds)

  const keysByCu = new Map<string, string[]>()
  for (const row of cuTags) {
    keysByCu.set(row.cuId, [...(keysByCu.get(row.cuId) ?? []), row.tagKey])
  }
  for (const link of links as any[]) {
    const keys = keysByCu.get(link.cuId) ?? []
    if (keys.length > 0) {
      inheritedByCur.set(link.curId, [...new Set([...(inheritedByCur.get(link.curId) ?? []), ...keys])])
    }
  }
  for (const row of curTags) {
    rowsByCur.set(row.curId, [...(rowsByCur.get(row.curId) ?? []), row])
  }

  return { inheritedByCur, rowsByCur }
}

export async function tagStateForCurs(curIds: string[]): Promise<CurTagState> {
  return await tagStateFrom(PublishedCurCourseTag, PublishedCuCourseTag, curIds)
}

export async function draftTagStateForCurs(curIds: string[]): Promise<CurTagState> {
  return await tagStateFrom(CurCourseTag, CuCourseTag, curIds)
}

export async function setCurTag(curId: string, tagKey: string, mode: CourseTagMode): Promise<void> {
  await bulkSetCurTags([curId], [tagKey], mode)
}

export async function clearCurTag(curId: string, tagKey: string): Promise<number> {
  return await bulkClearCurTags([curId], [tagKey])
}

export async function bulkSetCurTags(curIds: string[], tagKeys: string[], mode: CourseTagMode): Promise<number> {
  const tagIds = await tagIdsByKey()
  const wantedTagIds = tagKeys.map(key => tagIds.get(key)).filter(id => id !== undefined)
  if (curIds.length === 0 || wantedTagIds.length === 0) return 0

  const rows = curIds.flatMap(curId => wantedTagIds.map(courseTagId => ({ curId, courseTagId, mode })))
  await CurCourseTag.bulkCreate(rows as any, { updateOnDuplicate: ['mode', 'updatedAt'] })
  return rows.length
}

export async function bulkClearCurTags(curIds: string[], tagKeys: string[]): Promise<number> {
  const tagIds = await tagIdsByKey()
  const wantedTagIds = tagKeys.map(key => tagIds.get(key)).filter(id => id !== undefined)
  if (curIds.length === 0 || wantedTagIds.length === 0) return 0

  return await CurCourseTag.destroy({ where: { curId: curIds, courseTagId: wantedTagIds } })
}

export async function setCuTag(cuId: string, tagKey: string, present: boolean): Promise<void> {
  const tagIds = await tagIdsByKey()
  const courseTagId = tagIds.get(tagKey)
  if (courseTagId === undefined) return

  if (present) {
    await CuCourseTag.findOrCreate({ where: { cuId, courseTagId } })
    return
  }
  await CuCourseTag.destroy({ where: { cuId, courseTagId } })
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

export async function bulkApplyTagsToFilter(
  filters: CourseSearchFilters,
  tagKeys: string[],
  mode: CourseTagMode | 'clear'
): Promise<{ matched: number; changed: number }> {
  const curIds = await matchingCurIds(filters)
  const changed =
    mode === 'clear' ? await bulkClearCurTags(curIds, tagKeys) : await bulkSetCurTags(curIds, tagKeys, mode)
  return { matched: curIds.length, changed }
}

async function tagPayloadFrom(curModel: any, cuModel: any): Promise<TagSnapshotPayload> {
  const tags = await allCourseTags()
  const cuRows = await cuModel.findAll({
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  const curRows = await curModel.findAll({
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })

  return {
    exportedAt: new Date().toISOString(),
    tags: tags.map(({ key, description }) => ({ key, description })),
    cuTags: cuRows.map((row: any) => ({ cuId: row.cuId, tagKey: row.tag.key })),
    curTags: curRows.map((row: any) => ({ curId: row.curId, tagKey: row.tag.key, mode: row.mode as CourseTagMode })),
  }
}

export async function fullTagPayload(): Promise<TagSnapshotPayload> {
  return await tagPayloadFrom(CurCourseTag, CuCourseTag)
}

export async function publishedTagPayload(): Promise<TagSnapshotPayload> {
  return await tagPayloadFrom(PublishedCurCourseTag, PublishedCuCourseTag)
}

export async function pendingTagChanges(): Promise<TagPayloadDiff> {
  return diffTagPayloads(await publishedTagPayload(), await fullTagPayload())
}

export async function publishTagState(publishedBy: string | null): Promise<{ cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await PublishedCurCourseTag.destroy({ where: {}, transaction })
    await PublishedCuCourseTag.destroy({ where: {}, transaction })

    const cuRows = await CuCourseTag.findAll({ attributes: ['cuId', 'courseTagId'], raw: true, transaction })
    const curRows = await CurCourseTag.findAll({ attributes: ['curId', 'courseTagId', 'mode'], raw: true, transaction })

    await PublishedCuCourseTag.bulkCreate(cuRows as any, { transaction })
    await PublishedCurCourseTag.bulkCreate(curRows as any, { transaction })

    const payload = await tagPayloadFrom(CurCourseTag, CuCourseTag)
    await TagSnapshot.create(
      {
        name: `${AUTO_SNAPSHOT_NAME_PREFIX} ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`,
        description: `${curRows.length} realisation and ${cuRows.length} course unit assignments`,
        createdBy: publishedBy,
        payload,
      } as any,
      { transaction }
    )

    return { cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function discardTagDraft(): Promise<{ cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await CurCourseTag.destroy({ where: {}, transaction })
    await CuCourseTag.destroy({ where: {}, transaction })

    const cuRows = await PublishedCuCourseTag.findAll({ attributes: ['cuId', 'courseTagId'], raw: true, transaction })
    const curRows = await PublishedCurCourseTag.findAll({
      attributes: ['curId', 'courseTagId', 'mode'],
      raw: true,
      transaction,
    })

    await CuCourseTag.bulkCreate(cuRows as any, { transaction })
    await CurCourseTag.bulkCreate(curRows as any, { transaction })

    return { cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function replaceTagState(
  payload: TagSnapshotPayload
): Promise<{ tags: number; cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await CurCourseTag.destroy({ where: {}, transaction })
    await CuCourseTag.destroy({ where: {}, transaction })

    for (const tag of payload.tags) {
      await CourseTag.upsert(tag as any, { transaction })
    }

    const tagRows = await CourseTag.findAll({ attributes: ['id', 'key'], raw: true, transaction })
    const idByKey = new Map(tagRows.map((row: any) => [row.key, row.id]))

    const cuRows = payload.cuTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ cuId: row.cuId, courseTagId: idByKey.get(row.tagKey) }))
    const curRows = payload.curTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ curId: row.curId, courseTagId: idByKey.get(row.tagKey), mode: row.mode }))

    await CuCourseTag.bulkCreate(cuRows as any, { ignoreDuplicates: true, transaction })
    await CurCourseTag.bulkCreate(curRows as any, { ignoreDuplicates: true, transaction })

    return { tags: payload.tags.length, cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function allTagSnapshots(): Promise<TagSnapshotMeta[]> {
  const rows = await TagSnapshot.findAll({
    attributes: ['id', 'name', 'description', 'createdBy', 'createdAt'],
    order: [['createdAt', 'DESC']],
    raw: true,
  })
  return rows as unknown as TagSnapshotMeta[]
}

export async function tagSnapshotById(id: number): Promise<TagSnapshotPayload | null> {
  const row = await TagSnapshot.findByPk(id)
  return row ? ((row.get('payload') as TagSnapshotPayload) ?? null) : null
}

export async function createTagSnapshot(
  name: string,
  description: string | null,
  createdBy: string | null
): Promise<TagSnapshotMeta> {
  const payload = await fullTagPayload()
  const created = await TagSnapshot.create({ name, description, createdBy, payload } as any)
  return created.toJSON() as TagSnapshotMeta
}

export async function deleteTagSnapshotById(id: number): Promise<number> {
  return await TagSnapshot.destroy({ where: { id } })
}

export async function courseUnitGroupsForFilters(
  filters: CourseSearchFilters,
  page: number,
  limit: number
): Promise<{ groups: CourseUnitGroup[]; total: number; page: number; limit: number; totalPages: number }> {
  const curIds = await matchingCurIds(filters)
  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })
  const cuIds = [...new Set(links.map((link: any) => link.cuId))]
  const cus = await Cu.findAll({ where: { id: cuIds }, attributes: ['id', 'courseCode', 'name'], raw: true })
  const tagRows = await cuTagRowsForCus(cuIds)

  const codeByCuId = new Map(cus.map((cu: any) => [cu.id, cu.courseCode]))
  const groups = new Map<string, CourseUnitGroup>()
  const curIdsByCode = new Map<string, Set<string>>()

  for (const cu of cus as any[]) {
    const group = groups.get(cu.courseCode)
    if (group) {
      group.cuIds.push(cu.id)
    } else {
      groups.set(cu.courseCode, {
        courseCode: cu.courseCode,
        name: cu.name,
        cuIds: [cu.id],
        realisationCount: 0,
        tagKeys: [],
      })
    }
  }

  for (const link of links as any[]) {
    const code = codeByCuId.get(link.cuId)
    if (!code) continue
    curIdsByCode.set(code, (curIdsByCode.get(code) ?? new Set()).add(link.curId))
  }

  for (const row of tagRows) {
    const code = codeByCuId.get(row.cuId)
    const group = code ? groups.get(code) : undefined
    if (group && !group.tagKeys.includes(row.tagKey)) {
      group.tagKeys.push(row.tagKey)
    }
  }

  const ordered = [...groups.values()].sort((a, b) => a.courseCode.localeCompare(b.courseCode))
  for (const group of ordered) {
    group.realisationCount = curIdsByCode.get(group.courseCode)?.size ?? 0
  }

  const offset = (page - 1) * limit
  return {
    groups: ordered.slice(offset, offset + limit),
    total: ordered.length,
    page,
    limit,
    totalPages: Math.ceil(ordered.length / limit),
  }
}

export async function setCourseUnitGroupTag(courseCode: string, tagKey: string, present: boolean): Promise<number> {
  const tagIds = await tagIdsByKey()
  const courseTagId = tagIds.get(tagKey)
  if (courseTagId === undefined) return 0

  const cus = await Cu.findAll({ where: { courseCode }, attributes: ['id'], raw: true })
  const cuIds = cus.map((cu: any) => cu.id)
  if (cuIds.length === 0) return 0

  if (!present) {
    return await CuCourseTag.destroy({ where: { cuId: cuIds, courseTagId } })
  }

  await CuCourseTag.bulkCreate(cuIds.map(cuId => ({ cuId, courseTagId })) as any, { ignoreDuplicates: true })
  return cuIds.length
}
