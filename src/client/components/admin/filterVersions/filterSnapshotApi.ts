import type { QueryClient } from '@tanstack/react-query'

import type {
  FilterBase,
  FilterMutations,
  FilterPayloadDiff,
  FilterSnapshotMeta,
  FilterSnapshotPayload,
} from '../../../../common/types.ts'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'

export const FILTER_SNAPSHOTS_PATH = '/api/admin/filter-config/snapshots'

export const fetchFilterSnapshots = async (): Promise<FilterSnapshotMeta[]> =>
  (await adminFetch('GET', FILTER_SNAPSHOTS_PATH)).json()

export const fetchFilterSnapshotPayload = async (id: number): Promise<FilterSnapshotPayload> =>
  (await adminFetch('GET', `${FILTER_SNAPSHOTS_PATH}/${id}`)).json()

export const fetchFilterPublishDiff = async (id: number): Promise<FilterPayloadDiff> =>
  (await adminFetch('GET', `${FILTER_SNAPSHOTS_PATH}/${id}/publish-diff`)).json()

export const createFilterSnapshot = (
  name: string,
  description: string | null,
  base: FilterBase,
  mutations: FilterMutations
) => adminFetch('POST', FILTER_SNAPSHOTS_PATH, { name, description, base, mutations })

export const updateFilterSnapshot = (id: number, name: string, description: string | null) =>
  adminFetch('PATCH', `${FILTER_SNAPSHOTS_PATH}/${id}`, { name, description })

export const deleteFilterSnapshot = (id: number) => adminFetch('DELETE', `${FILTER_SNAPSHOTS_PATH}/${id}`)

export const activateFilterSnapshot = (id: number) => adminFetch('POST', `${FILTER_SNAPSHOTS_PATH}/${id}/activate`)

export const overwriteFilterSnapshot = (id: number, payload: FilterSnapshotPayload) =>
  adminFetch('POST', `${FILTER_SNAPSHOTS_PATH}/${id}/overwrite`, payload)

export const mutateFilterSnapshot = async (id: number, mutations: FilterMutations) => {
  const response = await adminFetch('POST', `${FILTER_SNAPSHOTS_PATH}/${id}/mutate`, { mutations })
  if (!response.ok) throw new Error(`filter wording mutation failed with ${response.status}`)
  return await response.json()
}

export const FILTER_VERSION_QUERY_KEYS = ['filter-snapshots', 'filter-config', 'admin-filter-config']

export const invalidateFilterVersionQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({
    predicate: query => FILTER_VERSION_QUERY_KEYS.some(key => String(query.queryKey[0]).startsWith(key)),
  })
}
