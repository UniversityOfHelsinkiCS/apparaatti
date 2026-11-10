import { Alert, MenuItem, Stack, TextField } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { emptyFilterMutations } from '../../../../common/filterWordings.ts'
import type { FilterSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import FilterPublishReviewDialog from './FilterPublishReviewDialog.tsx'
import { createFilterSnapshot, fetchFilterSnapshots, invalidateFilterVersionQueries } from './filterSnapshotApi.ts'
import { storeEditingFilterVersionId } from './filterVersionState.ts'
import NewFilterVersionDialog from './NewFilterVersionDialog.tsx'

const FilterEditingVersionBar = ({ isSuperuser }: { isSuperuser: boolean }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [reviewed, setReviewed] = useState<FilterSnapshotMeta | null>(null)

  const { data: snapshots } = useQuery({ queryKey: ['filter-snapshots'], queryFn: fetchFilterSnapshots })
  const versions = snapshots ?? []

  const activeVersionName = versions.find(snapshot => snapshot.isActive)?.name ?? null
  const selectedVersion = versions.find(snapshot => snapshot.id === selectedId) ?? null

  const create = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string | null }) => {
      const response = await createFilterSnapshot(name, description, { kind: 'published' }, emptyFilterMutations)
      return (await response.json()) as FilterSnapshotMeta
    },
    onSuccess: async created => {
      setIsNewOpen(false)
      await invalidateFilterVersionQueries(queryClient)
      setSelectedId(created.id)
    },
  })

  const enterEditMode = () => {
    if (selectedId === null) {
      return
    }
    storeEditingFilterVersionId(selectedId)
    window.location.assign('/')
  }

  const liveLine = activeVersionName
    ? t('v2:filterVersions.liveVersion', { name: activeVersionName })
    : t('v2:filterVersions.liveUnknown')

  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
        <TextField
          select
          size="small"
          label={t('v2:filterVersions.label')}
          value={selectedId === null ? 'published' : String(selectedId)}
          onChange={event => setSelectedId(event.target.value === 'published' ? null : Number(event.target.value))}
          sx={{ minWidth: 280 }}
        >
          <MenuItem value="published">{t('v2:filterVersions.published')}</MenuItem>
          {versions.map(version => (
            <MenuItem key={version.id} value={String(version.id)}>
              {version.isActive ? `${version.name} — ${t('v2:filterVersions.activeShort')}` : version.name}
            </MenuItem>
          ))}
        </TextField>

        <BlackOutlinedButton type="button" onClick={() => setIsNewOpen(true)} disabled={create.isPending}>
          {t('v2:filterVersions.new')}
        </BlackOutlinedButton>

        <BlackOutlinedButton type="button" onClick={enterEditMode} disabled={selectedId === null}>
          {t('v2:filterVersions.enterEditMode')}
        </BlackOutlinedButton>

        {selectedVersion && isSuperuser ? (
          <BlackOutlinedButton type="button" onClick={() => setReviewed(selectedVersion)}>
            {t('v2:filterVersions.publish.publishVersion')}
          </BlackOutlinedButton>
        ) : null}
      </Stack>

      <Alert severity={selectedVersion ? 'info' : 'warning'}>
        {selectedVersion
          ? `${t('v2:filterVersions.editingVersion', { name: selectedVersion.name })} ${liveLine}`
          : `${t('v2:filterVersions.pickVersion')} ${liveLine}`}
      </Alert>

      <NewFilterVersionDialog
        open={isNewOpen}
        isBusy={create.isPending}
        onClose={() => setIsNewOpen(false)}
        onCreate={(name, description) => create.mutate({ name, description })}
      />

      <FilterPublishReviewDialog snapshot={reviewed} onClose={() => setReviewed(null)} />
    </Stack>
  )
}

export default FilterEditingVersionBar
