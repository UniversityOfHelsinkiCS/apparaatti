import type { QueryClient } from '@tanstack/react-query'

import type {
  CourseTag,
  CourseTagMode,
  CourseUnitGroup,
  LocalizedString,
  ResolvedCurTag,
  TagPayloadDiff,
  TagSnapshotMeta,
} from '../../../../common/types.ts'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import { courseSearchFilterParams } from '../courseSearchQuery.ts'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'

export const COURSE_TAGS_PATH = '/api/admin/course-tags'

export type CurTagMutationMode = CourseTagMode | 'clear'

export interface CurTagState {
  curId: string
  tags: ResolvedCurTag[]
}

export interface BulkApplyResult {
  matched: number
  changed: number
}

export const fetchCourseTags = async (): Promise<CourseTag[]> => (await adminFetch('GET', COURSE_TAGS_PATH)).json()

const CUR_STATE_BATCH = 100

export const fetchCurTagStates = async (curIds: string[]): Promise<CurTagState[]> => {
  if (curIds.length === 0) return []

  const batches: string[][] = []
  for (let start = 0; start < curIds.length; start += CUR_STATE_BATCH) {
    batches.push(curIds.slice(start, start + CUR_STATE_BATCH))
  }

  const responses = await Promise.all(
    batches.map(batch => adminFetch('GET', `${COURSE_TAGS_PATH}/cur-state?curIds=${batch.join(',')}`))
  )

  return (await Promise.all(responses.map(response => response.json()))).flat()
}

export const saveCurTag = (curId: string, tagKey: string, mode: CurTagMutationMode) =>
  adminFetch('PUT', `${COURSE_TAGS_PATH}/cur/${curId}`, { tagKey, mode })

export const saveCourseUnitTag = (courseCode: string, tagKey: string, present: boolean) =>
  adminFetch('PUT', `${COURSE_TAGS_PATH}/course-unit/${encodeURIComponent(courseCode)}`, { tagKey, present })

const bulkBody = (values: CourseSearchValues, tagKeys: string[], mode: CurTagMutationMode) => ({
  filters: courseSearchFilterParams(values),
  tagKeys,
  mode,
})

export const previewBulkApply = async (
  values: CourseSearchValues,
  tagKeys: string[],
  mode: CurTagMutationMode
): Promise<{ matched: number }> =>
  (await adminFetch('POST', `${COURSE_TAGS_PATH}/bulk/preview`, bulkBody(values, tagKeys, mode))).json()

export const applyBulkTags = async (
  values: CourseSearchValues,
  tagKeys: string[],
  mode: CurTagMutationMode
): Promise<BulkApplyResult> =>
  (await adminFetch('POST', `${COURSE_TAGS_PATH}/bulk`, bulkBody(values, tagKeys, mode))).json()

export const fetchSnapshots = async (): Promise<TagSnapshotMeta[]> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots`)).json()

export const fetchSnapshotDiff = async (id: number): Promise<TagPayloadDiff> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/snapshots/${id}/diff`)).json()

export const createSnapshot = (name: string, description: string | null) =>
  adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots`, { name, description })

export const restoreSnapshot = (id: number) => adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots/${id}/restore`)

export const activateSnapshot = (id: number) => adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots/${id}/activate`)

export interface EditedSnapshot {
  id: number
  name: string
}

export const updateSnapshot = (id: number, name: string, description: string | null) =>
  adminFetch('PATCH', `${COURSE_TAGS_PATH}/snapshots/${id}`, { name, description })

export const overwriteSnapshot = (id: number) => adminFetch('POST', `${COURSE_TAGS_PATH}/snapshots/${id}/overwrite`)

export const deleteSnapshot = (id: number) => adminFetch('DELETE', `${COURSE_TAGS_PATH}/snapshots/${id}`)

export const fetchPendingChanges = async (): Promise<TagPayloadDiff> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/pending`)).json()

export const publishDraft = async (description: string | null = null): Promise<{ cuTags: number; curTags: number }> =>
  (await adminFetch('POST', `${COURSE_TAGS_PATH}/publish`, { description })).json()

export const discardDraft = async (): Promise<{ cuTags: number; curTags: number }> =>
  (await adminFetch('POST', `${COURSE_TAGS_PATH}/discard`)).json()

export const TAG_QUERY_KEYS = [
  'course-tags',
  'course-tag-states',
  'course-tag-cu-states',
  'course-tag-pending',
  'course-tag-snapshots',
]

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

export const fetchCoursesForLabels = async (): Promise<DiffCourse[]> =>
  (await (await adminFetch('GET', '/api/admin/courses?page=1&limit=100000')).json()).courses

export const fetchCourseUnitGroupsForLabels = async (): Promise<CourseUnitGroup[]> =>
  (await (await adminFetch('GET', `${COURSE_TAGS_PATH}/course-units?page=1&limit=100000`)).json()).groups
