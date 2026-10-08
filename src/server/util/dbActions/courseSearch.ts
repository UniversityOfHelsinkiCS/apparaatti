import { Op } from 'sequelize'

import { resolveCurTags, tagsToCustomCodeUrns } from '../../../common/courseTags.ts'
import type { UrnMatchMode } from '../../../common/types.ts'
import Cu from '../../db/models/cu.ts'
import Cur from '../../db/models/cur.ts'
import { reviewsForCurIds } from './courseAdminReview.ts'
import { tagStateForCurs } from './courseTags.ts'

function parseCsvList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function getCurUrnsLowercase(cur: any, resolvedTagKeys: string[]): string[] {
  const customCodeUrns = cur.customCodeUrns as Record<string, string[]> | null
  const withTags = resolvedTagKeys.length > 0 ? tagsToCustomCodeUrns(customCodeUrns, resolvedTagKeys) : customCodeUrns
  if (!withTags) return []
  return Object.values(withTags)
    .flat()
    .map(u => u.toLowerCase())
}

async function resolvedTagKeysByCur(curIds: string[]): Promise<Map<string, string[]>> {
  const tagging = await tagStateForCurs(curIds)
  const byCur = new Map<string, string[]>()

  for (const curId of curIds) {
    const inherited = tagging.inheritedByCur.get(curId) ?? []
    const rows = tagging.rowsByCur.get(curId) ?? []
    if (inherited.length > 0 || rows.length > 0) byCur.set(curId, resolveCurTags(inherited, rows))
  }

  return byCur
}

// Include: with mode 'or' the Cur must match at least one of the given URN
// substrings, with 'and' it must match every one of them. Exclude: with 'or'
// the Cur is dropped as soon as one exclude substring matches, with 'and' only
// when every exclude substring matches. Empty lists never filter anything.
function curMatchesUrnFilters(
  cur: any,
  resolvedTagKeys: string[],
  includeUrnListLower: string[],
  includeMode: UrnMatchMode,
  excludeUrnListLower: string[],
  excludeMode: UrnMatchMode
): boolean {
  const urns = getCurUrnsLowercase(cur, resolvedTagKeys)
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

// Matches against the resolved tag keys only, never against customCodeUrns.
// Include/exclude mode semantics are the same as for the URN filters above.
function curMatchesTagFilters(
  resolvedTagKeys: string[],
  includeTagListLower: string[],
  includeMode: UrnMatchMode,
  excludeTagListLower: string[],
  excludeMode: UrnMatchMode
): boolean {
  const keys = resolvedTagKeys.map(key => key.toLowerCase())
  const matches = (needle: string) => keys.some(key => key.includes(needle))

  if (includeTagListLower.length > 0) {
    const included = includeMode === 'and' ? includeTagListLower.every(matches) : includeTagListLower.some(matches)
    if (!included) return false
  }
  if (excludeTagListLower.length > 0) {
    const excluded = excludeMode === 'and' ? excludeTagListLower.every(matches) : excludeTagListLower.some(matches)
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

  // --- Tag filters (operate on the resolved tag keys of the searched version) ---
  /** Comma-separated tag-key substrings; Curs are kept per `tagMode`. */
  tagSearch?: string
  /** 'or' (default) keeps Curs matching any `tagSearch` substring, 'and' requires every one. */
  tagMode?: UrnMatchMode
  /** Comma-separated tag-key substrings; Curs are excluded per `excludeTagsMode`. */
  excludeTags?: string
  /** 'or' (default) excludes Curs matching any substring, 'and' only those matching every one. */
  excludeTagsMode?: UrnMatchMode

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

  const reviews = await reviewsForCurIds(plainCurs.map(cur => cur.id))
  const latestReviewByCurId = new Map(reviews.map((review: any) => [review.curId, review]))

  return plainCurs.map(cur => ({ ...cur, reviewState: latestReviewByCurId.get(cur.id) ?? null }))
}

interface CourseSearchQuery {
  curWhere: any
  includeOptions: any[]
  includeUrnList: string[]
  urnMode: UrnMatchMode
  excludeUrnList: string[]
  excludeUrnsMode: UrnMatchMode
  includeTagList: string[]
  tagMode: UrnMatchMode
  excludeTagList: string[]
  excludeTagsMode: UrnMatchMode
}

/** Resolves the tag keys that apply to each of the given Curs. */
export type TagKeyResolver = (curIds: string[]) => Promise<Map<string, string[]>>

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
    includeTagList: parseCsvList(filters.tagSearch).map(s => s.toLowerCase()),
    tagMode: filters.tagMode ?? 'or',
    excludeTagList: parseCsvList(filters.excludeTags).map(s => s.toLowerCase()),
    excludeTagsMode: filters.excludeTagsMode ?? 'or',
  }
}

export async function matchingCurs(
  filters: CourseSearchFilters,
  resolveTagKeys: TagKeyResolver = resolvedTagKeysByCur
) {
  const query = await buildCourseSearchQuery(filters)

  const allCurs = await Cur.findAll({
    where: query.curWhere,
    include: query.includeOptions,
    order: [['name', 'ASC']],
    subQuery: false,
  })

  const needsTagKeys =
    query.includeUrnList.length > 0 ||
    query.excludeUrnList.length > 0 ||
    query.includeTagList.length > 0 ||
    query.excludeTagList.length > 0
  const tagKeysByCur = needsTagKeys
    ? await resolveTagKeys(allCurs.map((cur: any) => cur.id))
    : new Map<string, string[]>()

  const filtered = allCurs.filter(cur => {
    const tagKeys = tagKeysByCur.get(cur.id) ?? []
    const tagsMatch = curMatchesTagFilters(
      tagKeys,
      query.includeTagList,
      query.tagMode,
      query.excludeTagList,
      query.excludeTagsMode
    )
    if (!tagsMatch) return false

    return curMatchesUrnFilters(
      cur,
      tagKeys,
      query.includeUrnList,
      query.urnMode,
      query.excludeUrnList,
      query.excludeUrnsMode
    )
  })

  return filterCoursesByReviewStatus(await populateWithReviews(filtered), filters.reviewStatus)
}

export async function matchingCurIds(filters: CourseSearchFilters, resolveTagKeys?: TagKeyResolver): Promise<string[]> {
  return (await matchingCurs(filters, resolveTagKeys)).map(cur => cur.id)
}

export async function searchCoursesWithPagination(
  filters: CourseSearchFilters,
  page: number,
  limit: number,
  resolveTagKeys?: TagKeyResolver
) {
  const offset = (page - 1) * limit
  const matched = await matchingCurs(filters, resolveTagKeys)
  const total = matched.length

  return {
    courses: matched.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
