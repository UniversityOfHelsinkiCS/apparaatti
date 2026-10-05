import type { QueryClient } from '@tanstack/react-query'

import type {
  CourseTag,
  CourseTagMode,
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

export interface CuTagState {
  cuId: string
  tagKeys: string[]
  realisationCount: number
}

export interface BulkApplyResult {
  matched: number
  changed: number
}

export const fetchCourseTags = async (): Promise<CourseTag[]> => (await adminFetch('GET', COURSE_TAGS_PATH)).json()

export const fetchCurTagStates = async (curIds: string[]): Promise<CurTagState[]> => {
  if (curIds.length === 0) return []
  const response = await adminFetch('GET', `${COURSE_TAGS_PATH}/cur-state?curIds=${curIds.join(',')}`)
  return response.json()
}

export const fetchCuTagStates = async (cuIds: string[]): Promise<CuTagState[]> => {
  if (cuIds.length === 0) return []
  const response = await adminFetch('GET', `${COURSE_TAGS_PATH}/cu-state?cuIds=${cuIds.join(',')}`)
  return response.json()
}

export const saveCurTag = (curId: string, tagKey: string, mode: CurTagMutationMode) =>
  adminFetch('PUT', `${COURSE_TAGS_PATH}/cur/${curId}`, { tagKey, mode })

export const saveCuTag = (cuId: string, tagKey: string, present: boolean) =>
  adminFetch('PUT', `${COURSE_TAGS_PATH}/cu/${cuId}`, { tagKey, present })

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

export const deleteSnapshot = (id: number) => adminFetch('DELETE', `${COURSE_TAGS_PATH}/snapshots/${id}`)

export const fetchPendingChanges = async (): Promise<TagPayloadDiff> =>
  (await adminFetch('GET', `${COURSE_TAGS_PATH}/pending`)).json()

export const publishDraft = async (): Promise<{ cuTags: number; curTags: number }> =>
  (await adminFetch('POST', `${COURSE_TAGS_PATH}/publish`)).json()

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
  await Promise.all(TAG_QUERY_KEYS.map(key => queryClient.invalidateQueries({ queryKey: [key] })))
}
