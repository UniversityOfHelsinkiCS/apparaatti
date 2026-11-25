import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MatchConditions } from '../../../common/conditionMatching'
import type {
  FilterConfig,
  FilterOption,
  FilterOptionSettings,
  FilterSettingsPatch,
  FilterVariant,
  LocalizedText,
} from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import type { ConditionDraft } from '../admin/backendLocaleEdit/backendLocaleUtils'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import FilterBasicSettingsTab from './FilterBasicSettingsTab'
import { type OptionChange, settingsMutations, type VariantChange } from './filterSettingsMutations'
import FilterSettingsTabs from './FilterSettingsTabs'
import FilterStructureSettingsTab from './FilterStructureSettingsTab'
import FilterTextsSettingsTab from './FilterTextsSettingsTab'
import { toVariantDraft, type VariantDraft } from './FilterVariantSettingsRow'

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

const toConditions = (draft: ConditionDraft): MatchConditions => ({
  organisationCode: draft.organisationCode || null,
  lang: draft.lang || null,
  primaryLanguage: draft.primaryLanguage || null,
  primaryLanguageSpecification: draft.primaryLanguageSpecification || null,
})

const sameConditions = (conditions: MatchConditions, variant: FilterVariant): boolean => {
  if (conditions.organisationCode !== variant.organisationCode) return false
  if (conditions.lang !== variant.lang) return false
  if (conditions.primaryLanguage !== variant.primaryLanguage) return false
  return conditions.primaryLanguageSpecification === variant.primaryLanguageSpecification
}

const FilterSettingsDialog = ({ filter, variantName, onClose }: FilterSettingsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { editingVersionId } = useFilterEditMode()
  const [tab, setTab] = useState(0)
  const [patch, setPatch] = useState<FilterSettingsPatch>({})
  const [optionDrafts, setOptionDrafts] = useState<Record<string, FilterOptionSettings>>({})
  const [deletedOptions, setDeletedOptions] = useState<string[]>([])
  const [addedOptions, setAddedOptions] = useState<{ optionId: string; name: LocalizedText }[]>([])
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantDraft>>(() =>
    Object.fromEntries(filter.variants.map(variant => [variant.name, toVariantDraft(variant)]))
  )

  const variant = filter.variants.find(candidate => candidate.name === variantName) ?? filter.variants[0]
  const options = variant?.options ?? []

  const optionChanges = (): OptionChange[] => {
    const changes: OptionChange[] = []

    for (const added of addedOptions) {
      changes.push({ kind: 'add', variantName: variant.name, optionId: added.optionId, name: added.name })
    }

    for (const [optionId, settings] of Object.entries(optionDrafts)) {
      if (deletedOptions.includes(optionId)) {
        continue
      }
      changes.push({ kind: 'settings', variantName: variant.name, optionId, settings })
    }

    for (const optionId of deletedOptions) {
      changes.push({ kind: 'delete', variantName: variant.name, optionId })
    }

    return changes
  }

  const variantChanges = (): VariantChange[] =>
    filter.variants.map(candidate => {
      const draft = variantDrafts[candidate.name]
      const conditions = toConditions(draft.conditions)
      const wasSkipped = candidate.skipped ?? false
      const wasDisabled = candidate.extraInfoDisabled ?? false
      return {
        variantName: candidate.name,
        conditions: sameConditions(conditions, candidate) ? null : conditions,
        skipped: draft.skipped === wasSkipped ? null : draft.skipped,
        extraInfoDisabled: draft.extraInfoDisabled === wasDisabled ? null : draft.extraInfoDisabled,
        newName: draft.name === candidate.name ? null : draft.name,
        deleted: draft.deleted,
      }
    })

  const save = useMutation({
    mutationFn: async () => {
      if (editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(
        editingVersionId,
        settingsMutations(filter.id, patch, optionChanges(), variantChanges())
      )
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

  const toggleDeletedOption = (option: FilterOption) => {
    setDeletedOptions(current =>
      current.includes(option.id) ? current.filter(id => id !== option.id) : [...current, option.id]
    )
  }

  const patchVariantDraft = (target: FilterVariant, change: Partial<VariantDraft>) => {
    setVariantDrafts(current => ({
      ...current,
      [target.name]: { ...(current[target.name] ?? toVariantDraft(target)), ...change },
    }))
  }

  const addOption = (optionId: string, name: LocalizedText) => {
    setAddedOptions(current => [...current, { optionId, name }])
  }

  const basicTab = (
    <FilterBasicSettingsTab
      filter={filter}
      patch={patch}
      onPatch={setPatch}
      variant={variant}
      options={options}
      optionDrafts={optionDrafts}
      addedOptions={addedOptions}
      variantDrafts={variantDrafts}
      onVariantChange={patchVariantDraft}
      onOptionChange={patchOption}
      onAddOption={addOption}
    />
  )

  const textsTab = <FilterTextsSettingsTab filter={filter} variant={variant} />

  const structureTab = (
    <FilterStructureSettingsTab
      filter={filter}
      patch={patch}
      onPatch={setPatch}
      variant={variant}
      options={options}
      optionDrafts={optionDrafts}
      deletedOptions={deletedOptions}
      variantDrafts={variantDrafts}
      onVariantChange={patchVariantDraft}
      onOptionChange={patchOption}
      onToggleDeletedOption={toggleDeletedOption}
    />
  )

  const body = [basicTab, textsTab, structureTab][tab] ?? basicTab

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" data-testid="filter-settings-dialog">
      <DialogTitle>{t('v2:filterSettings.title', { filter: filter.id })}</DialogTitle>
      <DialogContent>
        <FilterSettingsTabs value={tab} onChange={setTab} />
        {body}
      </DialogContent>
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
