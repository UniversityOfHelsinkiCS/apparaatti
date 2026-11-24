import { Alert, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { FilterConfig, FilterMutations, FilterSnapshotPayload } from '../../../common/types'
import {
  fetchFilterSnapshotPayload,
  invalidateFilterVersionQueries,
  mutateFilterSnapshot,
} from '../admin/filterVersions/filterSnapshotApi'
import FilterOrderRow from './FilterOrderRow'
import { flagMutations, orderMutations } from './filterSettingsMutations'

const byDisplayOrder = (a: FilterConfig, b: FilterConfig) => a.displayOrder - b.displayOrder

const FilterOrderList = ({ versionId }: { versionId: number }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data } = useQuery<FilterSnapshotPayload>({
    queryKey: [`filter-config-payload-${versionId}`],
    queryFn: () => fetchFilterSnapshotPayload(versionId),
  })

  const filters = [...(data?.filters ?? [])].sort(byDisplayOrder)

  const apply = useMutation({
    mutationFn: async (mutations: FilterMutations) => await mutateFilterSnapshot(versionId, mutations),
    onSuccess: async () => {
      await invalidateFilterVersionQueries(queryClient)
      await queryClient.invalidateQueries({ queryKey: [`filter-config-payload-${versionId}`] })
    },
  })

  const move = (index: number, direction: 1 | -1) => {
    const reordered = [...filters]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(index + direction, 0, moved)
    apply.mutate(orderMutations(reordered.map(filter => filter.id)))
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('v2:filterSettings.listTitle')}</Typography>
      <Alert severity="info">{t('v2:filterSettings.allVariantsNote')}</Alert>
      {filters.map((filter, index) => (
        <FilterOrderRow
          key={filter.id}
          filter={filter}
          isFirst={index === 0}
          isLast={index === filters.length - 1}
          isBusy={apply.isPending}
          onMove={direction => move(index, direction)}
          onToggleFlag={patch => apply.mutate(flagMutations(filter.id, patch))}
        />
      ))}
    </Stack>
  )
}

export default FilterOrderList
