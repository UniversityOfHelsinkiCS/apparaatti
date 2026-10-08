import type { QueryClient } from '@tanstack/react-query'

import type {
  CourseTag,
  CourseTagMode,
  CourseUnitGroup,
  CurTagPremises,
  LocalizedString,
  TagBase,
  TagMutations,
  TagPayloadDiff,
  TagSnapshotMeta,
  TagSnapshotPayload,
} from '../../../../common/types.ts'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import { courseSearchFilterParams } from '../courseSearchQuery.ts'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'

export const COURSE_TAGS_PATH = '/api/admin/course-tags'

export type CurTagMutationMode = CourseTagMode | 'clear'

export const emptyMutations: TagMutations = { tags: [], cur: [], cu: [] }

export const fetchCourseTags = async (): Promise<CourseTag[]> => (await adminFetch('GET', COURSE_TAGS_PATH)).json()

export const fetchVocabulary = async (base: TagBase): Promise<CourseTag[]> => {
  if (base.kind === 'published') return await fetchCourseTags()

  const payload: TagSnapshotPayload = await (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots/${base.id}`)).json()
  return payload.tags
    .map(tag => ({ id: -1, key: tag.key, description: tag.description }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const mutateSnapshot = async (id: number, mutations: TagMutations) => {
  const response = await adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots/${id}/mutate`, { mutations })
  if (!response.ok) throw new Error(`tag mutation failed with ${response.status}`)
  return await response.json()
}

const CUR_STATE_BATCH = 100

export const fetchCurTagPremises = async (curIds: string[], base: TagBase): Promise<CurTagPremises[]> => {
  if (curIds.length === 0) return []

  const batches: string[][] = []
  for (let start = 0; start < curIds.length; start += CUR_STATE_BATCH) {
    batches.push(curIds.slice(start, start + CUR_STATE_BATCH))
  }

  const responses = await Promise.all(
    batches.map(batch => adminFetch('POST', `${COURSE_TAGS_PATH}/cur-state`, { curIds: batch, base }))
  )

  const failed = responses.find(response => !response.ok)
  if (failed) throw new Error(`cur-state request failed with ${failed.status}`)

  return (await Promise.all(responses.map(response => response.json()))).flat()
}

export const previewBulkApply = async (
  values: CourseSearchValues,
  base: TagBase,
  tagKeys: string[],
  mode: CurTagMutationMode
): Promise<{ matched: number; curIds: string[] }> =>
  (
    await adminFetch('POST', `${COURSE_TAGS_PATH}/bulk/preview`, {
      filters: courseSearchFilterParams(values),
      base,
      tagKeys,
      mode,
    })
  ).json()

export const fetchSnapshots = async (): Promise<TagSnapshotMeta[]> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots`)).json()

export const fetchSnapshotDiff = async (id: number): Promise<TagPayloadDiff> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots/${id}/diff`)).json()

export const fetchPublishDiff = async (id: number): Promise<TagPayloadDiff> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots/${id}/publish-diff`)).json()

export interface DraftRequest {
  base: TagBase
  mutations: TagMutations
}

export const createSnapshot = (name: string, description: string | null, draft: DraftRequest) =>
  adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots`, { name, description, ...draft })

export const activateSnapshot = (id: number) => adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots/${id}/activate`)

export interface EditedSnapshot {
  id: number
  name: string
}

export const updateSnapshot = (id: number, name: string, description: string | null) =>
  adminFetch('PATCH', `${COURSE_TAGS_PATH}/snapshots/${id}`, { name, description })

export const deleteSnapshot = (id: number) => adminFetch('DELETE', `${COURSE_TAGS_PATH}/snapshots/${id}`)

export const TAG_QUERY_KEYS = ['course-tags', 'course-tag-states', 'course-tag-cu-states', 'course-tag-snapshots']

export const invalidateTagQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({
    predicate: query => TAG_QUERY_KEYS.some(key => String(query.queryKey[0]).startsWith(key)),
  })
}

export interface DiffCourseUnit {
  id: string
  courseCode: string
  name: LocalizedString
}

export interface DiffCourse {
  id: string
  name: LocalizedString
  nameSpecifier: LocalizedString
  startDate?: string
  Cus?: DiffCourseUnit[]
}

export const fetchCoursesForLabels = async (): Promise<DiffCourse[]> => {
  const response = await adminFetch('GET', '/api/admin/courses?page=1&limit=100000')
  const body = await response.json()
  return body.courses
}

export const fetchCourseUnitGroupsForLabels = async (): Promise<CourseUnitGroup[]> => {
  const response = await adminFetch('GET', `${COURSE_TAGS_PATH}/course-units?page=1&limit=100000`)
  const body = await response.json()
  return body.groups
}
