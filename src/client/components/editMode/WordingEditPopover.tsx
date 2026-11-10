import { Popover, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll } from '../../../common/conditionMatching'
import type { Language, LocalizedText } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import { describeFilterVariant } from './changeVariant'
import VariantSwitchRow from './VariantSwitchRow'
import VariantTargetChoice, { type PickedTarget } from './VariantTargetChoice'
import { emptyLocalized, isVariantField, textForVariant, wordingMutations } from './wordingMutations'
import WordingTextForm from './WordingTextForm'

const WordingEditPopover = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { target, closeTarget, editingVersionId, notifySaved } = useFilterEditMode()
  const [text, setText] = useState<LocalizedText>(emptyLocalized)
  const [picked, setPicked] = useState<PickedTarget | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!target) {
      return
    }
    setText(target.current)
    setIsDirty(false)
    setPicked(isVariantField(target) ? null : { mode: 'existing', variantName: target.variantName })
  }, [target])

  const pickTarget = (next: PickedTarget) => {
    if (!target) {
      return
    }
    setPicked(next)
    setIsDirty(false)
    if (next.mode === 'existing') {
      const variant = target.filterVariants.find(candidate => candidate.name === next.variantName)
      setText(textForVariant(target, variant))
    } else {
      setText(target.current)
    }
  }

  const changeText = (language: Language, value: string) => {
    setIsDirty(true)
    setText(current => ({ ...current, [language]: value }))
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!target || editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(editingVersionId, wordingMutations(target, text, picked))
    },
    onSuccess: async () => {
      await invalidateFilterVersionQueries(queryClient)
      if (target) {
        notifySaved(target.field)
      }
      closeTarget()
    },
  })

  if (!target) {
    return null
  }

  const defaultLabel = t('v2:filterWordings.choice.default')
  const currentVariant = target.filterVariants.find(variant => variant.name === target.variantName)
  const currentVariantLabel = currentVariant ? describeFilterVariant(currentVariant, defaultLabel) : target.variantName
  const pickedVariant =
    picked?.mode === 'existing' ? target.filterVariants.find(variant => variant.name === picked.variantName) : undefined

  return (
    <Popover
      open
      anchorEl={target.anchor}
      onClose={closeTarget}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: { sx: { p: 2, width: 420, maxWidth: '90vw' } } }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">{t(`v2:filterWordings.field.${target.field}`)}</Typography>
        <Typography variant="caption">
          {isVariantField(target)
            ? t('v2:filterWordings.popover.variantScope', { variant: currentVariantLabel })
            : t('v2:filterWordings.popover.filterScope')}
        </Typography>
        <VariantSwitchRow
          variantQuery={target.variantQuery}
          filterVariants={target.filterVariants}
          hasUnsavedChanges={isDirty}
          disabled={save.isPending}
          onApplied={closeTarget}
        />

        {picked === null ? (
          <VariantTargetChoice
            filterVariants={target.filterVariants}
            currentVariantName={target.variantName}
            variantQuery={target.variantQuery}
            onPick={pickTarget}
          />
        ) : (
          <WordingTextForm
            text={text}
            onChangeText={changeText}
            showDefaultWarning={pickedVariant !== undefined && isCatchAll(pickedVariant)}
            isSaving={save.isPending}
            saveFailed={save.isError}
            onCancel={closeTarget}
            onSave={() => save.mutate()}
          />
        )}
      </Stack>
    </Popover>
  )
}

export default WordingEditPopover
