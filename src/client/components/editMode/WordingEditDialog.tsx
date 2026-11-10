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
  const isPerVariant = isVariantField(target)
  const [step, setStep] = useState<'variant' | 'text'>(isPerVariant ? 'variant' : 'text')
  const [picked, setPicked] = useState<PickedTarget>({ mode: 'existing', variantName: target.variantName })
  const [text, setText] = useState<LocalizedText>(target.current)
  const [isDirty, setIsDirty] = useState(false)

  const save = useMutation({
    mutationFn: async () => {
      if (editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(editingVersionId, wordingMutations(target, text, picked))
    },
    onSuccess: async () => {
      await invalidateFilterVersionQueries(queryClient)
      notifySaved(target.field)
      closeTarget()
    },
  })

  const confirmTarget = (next: PickedTarget) => {
    if (!sameTarget(next, picked)) {
      setPicked(next)
      setIsDirty(false)
      if (next.mode === 'existing') {
        setText(
          textForVariant(
            target,
            target.filterVariants.find(variant => variant.name === next.variantName)
          )
        )
      } else {
        setText(target.current)
      }
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
          note={isPerVariant ? undefined : t(`v2:filterWordings.target.sharedNote.${target.field}`)}
          onChangeTarget={isPerVariant ? () => setStep('variant') : undefined}
          text={text}
          onChangeText={changeText}
          showDefaultWarning={isPerVariant && pickedVariant !== undefined && isCatchAll(pickedVariant)}
          isSaving={save.isPending}
          saveFailed={save.isError}
          onCancel={closeTarget}
          onSave={() => save.mutate()}
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
