import { Dialog, DialogTitle } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll } from '../../../common/conditionMatching'
import type { Language, LocalizedText } from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import VariantStep from './VariantStep'
import {
  describePickedTarget,
  hasOwnText,
  hasSharedFallback,
  isBlank,
  isDefaultVariant,
  isShortNameField,
  isVariantField,
  type PickedTarget,
  textForVariant,
  wordingMutations,
} from './wordingMutations'
import WordingTextForm from './WordingTextForm'

const sameTarget = (a: PickedTarget, b: PickedTarget) => JSON.stringify(a) === JSON.stringify(b)

/**
 * The wording editor wizard, in one modal:
 * 1. confirm (or change) which variant the text is saved to – only for variant-specific fields
 * 2. edit the text and save
 */
const WordingEditor = ({ target }: { target: EditTarget }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { closeTarget, editingVersionId, notifySaved } = useFilterEditMode()
  const isPerVariant = isVariantField(target.field)
  const [step, setStep] = useState<'variant' | 'text'>(isPerVariant ? 'variant' : 'text')
  const [picked, setPicked] = useState<PickedTarget>({ mode: 'existing', variantName: target.variantName })
  const [text, setText] = useState<LocalizedText>(target.current)
  const [isDirty, setIsDirty] = useState(false)

  const save = useMutation({
    mutationFn: async (payload: LocalizedText | null) => {
      if (editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(editingVersionId, wordingMutations(target, payload, picked))
    },
    onSuccess: async () => {
      await invalidateFilterVersionQueries(queryClient)
      notifySaved(target.field)
      closeTarget()
    },
  })

  const textForPicked = (next: PickedTarget): LocalizedText => {
    if (next.mode === 'new') {
      return target.current
    }
    return textForVariant(
      target,
      target.filterVariants.find(variant => variant.name === next.variantName)
    )
  }

  const confirmTarget = (next: PickedTarget) => {
    if (!sameTarget(next, picked)) {
      setPicked(next)
      setIsDirty(false)
      setText(textForPicked(next))
    }
    setStep('text')
  }

  const changeText = (language: Language, value: string) => {
    setIsDirty(true)
    setText(current => ({ ...current, [language]: value }))
  }

  const pickedVariant =
    picked.mode === 'existing' ? target.filterVariants.find(variant => variant.name === picked.variantName) : undefined
  const targetLabel = isPerVariant
    ? describePickedTarget(picked, target.filterVariants, {
        defaultLabel: t('v2:filterWordings.choice.default'),
        newVariant: variantKey => t('v2:filterWordings.target.newVariant', { variant: variantKey }),
      })
    : undefined
  const note = isPerVariant ? undefined : t(`v2:filterWordings.target.sharedNote.${target.field}`)
  const blocked = isShortNameField(target.field) && isBlank(text)
  const canClear =
    hasSharedFallback(target.field) &&
    picked.mode === 'existing' &&
    !isDefaultVariant(target.filterVariants, picked.variantName) &&
    hasOwnText(target, picked.variantName)

  return (
    <Dialog open onClose={closeTarget} maxWidth="sm" fullWidth data-testid="wording-edit-dialog">
      <DialogTitle>{t(`v2:filterWordings.field.${target.field}`)}</DialogTitle>
      {step === 'variant' ? (
        <VariantStep
          filterVariants={target.filterVariants}
          variantQuery={target.variantQuery}
          picked={picked}
          hasUnsavedChanges={isDirty}
          onCancel={closeTarget}
          onContinue={confirmTarget}
        />
      ) : (
        <WordingTextForm
          targetLabel={targetLabel}
          note={note}
          onChangeTarget={isPerVariant ? () => setStep('variant') : undefined}
          text={text}
          onChangeText={changeText}
          showDefaultWarning={isPerVariant && pickedVariant !== undefined && isCatchAll(pickedVariant)}
          isSaving={save.isPending}
          saveFailed={save.isError}
          saveDisabled={blocked}
          blankWarning={blocked ? t('v2:filterWordings.popover.shortNameRequired') : undefined}
          onUseShared={canClear ? () => save.mutate(null) : undefined}
          onCancel={closeTarget}
          onSave={() => save.mutate(isBlank(text) ? null : text)}
        />
      )}
    </Dialog>
  )
}

/** Opens the wording editor for the text clicked in edit mode; a new click starts a fresh wizard. */
const WordingEditDialog = () => {
  const { target } = useFilterEditMode()

  if (!target) {
    return null
  }

  return <WordingEditor key={`${target.filterId}:${target.field}:${target.optionId ?? ''}`} target={target} />
}

export default WordingEditDialog
