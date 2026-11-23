import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { FilterConfig, FilterOption, FilterOptionSettings, FilterSettingsPatch } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import FilterOptionSettingsRow from './FilterOptionSettingsRow'
import FilterSettingsFlags from './FilterSettingsFlags'
import { type OptionSettingsEntry, settingsMutations } from './filterSettingsMutations'

type FilterSettingsDialogProps = {
  filter: FilterConfig
  variantName: string
  onClose: () => void
}

const toSettings = (option: FilterOption): FilterOptionSettings => ({
  id: option.id,
  valueOverride: option.valueOverride ?? null,
  selectedByDefault: option.selectedByDefault ?? false,
})

const FilterSettingsDialog = ({ filter, variantName, onClose }: FilterSettingsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { editingVersionId } = useFilterEditMode()
  const [patch, setPatch] = useState<FilterSettingsPatch>({})
  const [optionDrafts, setOptionDrafts] = useState<Record<string, FilterOptionSettings>>({})

  const variant = filter.variants.find(candidate => candidate.name === variantName) ?? filter.variants[0]
  const options = variant?.options ?? []

  const optionEntries = (): OptionSettingsEntry[] =>
    Object.entries(optionDrafts).map(([optionId, settings]) => ({
      variantName: variant.name,
      optionId,
      settings,
    }))

  const save = useMutation({
    mutationFn: async () => {
      if (editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(editingVersionId, settingsMutations(filter.id, patch, optionEntries()))
    },
    onSuccess: async () => {
      await invalidateFilterVersionQueries(queryClient)
      onClose()
    },
  })

  const patchOption = (option: FilterOption, change: Partial<FilterOptionSettings>) => {
    setOptionDrafts(current => ({
      ...current,
      [option.id]: { ...(current[option.id] ?? toSettings(option)), ...change },
    }))
  }

  const body = (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('v2:filterSettings.filterSection')}</Typography>
        <Typography variant="caption">{t('v2:filterSettings.allVariantsNote')}</Typography>
        <FilterSettingsFlags filter={filter} patch={patch} onPatch={setPatch} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t('v2:filterSettings.optionsSection', { variant: variant?.name ?? '' })}
        </Typography>
        <Typography variant="caption">{t('v2:filterSettings.thisVariantNote')}</Typography>
        {options.length === 0 && <Typography variant="body2">{t('v2:filterSettings.noOptions')}</Typography>}
        {options.map(option => (
          <FilterOptionSettingsRow
            key={option.id}
            option={option}
            draft={optionDrafts[option.id]}
            onChange={change => patchOption(option, change)}
          />
        ))}
      </Stack>
    </Stack>
  )

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" data-testid="filter-settings-dialog">
      <DialogTitle>{t('v2:filterSettings.title', { filter: filter.id })}</DialogTitle>
      <DialogContent>{body}</DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose} disabled={save.isPending}>
          {t('v2:filterSettings.cancel')}
        </BlackOutlinedButton>
        <BlackContainedButton type="button" onClick={() => save.mutate()} disabled={save.isPending}>
          {t('v2:filterSettings.save')}
        </BlackContainedButton>
      </DialogActions>
    </Dialog>
  )
}

export default FilterSettingsDialog
