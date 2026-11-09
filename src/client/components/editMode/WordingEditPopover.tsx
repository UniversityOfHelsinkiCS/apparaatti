import { Alert, Box, CircularProgress, Popover, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeConditions, isCatchAll } from '../../../common/conditionMatching'
import type {
  FilterMutations,
  FilterVariant,
  FilterWordingMutation,
  Language,
  LocalizedText,
} from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import VariantTargetChoice, { type PickedTarget } from './VariantTargetChoice'

const LANGUAGES: Language[] = ['fi', 'sv', 'en']
const emptyLocalized: LocalizedText = { fi: '', sv: '', en: '' }

const isVariantField = (target: EditTarget) =>
  target.field === 'question' || target.field === 'explanation' || target.field === 'option'

const describeVariant = (variant: FilterVariant, t: (key: string) => string): string =>
  isCatchAll(variant) ? t('v2:filterWordings.choice.default') : describeConditions(variant)

const textForVariant = (target: EditTarget, variant: FilterVariant | undefined): LocalizedText => {
  if (!variant) {
    return emptyLocalized
  }
  if (target.field === 'question') {
    return variant.question
  }
  if (target.field === 'explanation') {
    return variant.explanation ?? emptyLocalized
  }
  if (target.field === 'option') {
    return variant.options?.find(option => option.id === target.optionId)?.name ?? emptyLocalized
  }
  return emptyLocalized
}

export const wordingMutations = (
  target: EditTarget,
  text: LocalizedText,
  picked: PickedTarget | null
): FilterMutations => {
  const wordings: FilterWordingMutation[] = []
  let variantName = target.variantName

  if (picked?.mode === 'new') {
    variantName = describeConditions(picked.conditions)
    wordings.push({
      op: 'createVariant',
      filterId: target.filterId,
      variantName,
      fromVariantName: target.variantName,
      organisationCode: picked.conditions.organisationCode,
      lang: picked.conditions.lang,
      primaryLanguage: picked.conditions.primaryLanguage,
      primaryLanguageSpecification: picked.conditions.primaryLanguageSpecification,
    })
  } else if (picked?.mode === 'existing') {
    variantName = picked.variantName
  }

  if (target.field === 'shortName') {
    wordings.push({ op: 'shortName', filterId: target.filterId, text })
  } else if (target.field === 'extraInfo') {
    wordings.push({ op: 'extraInfo', filterId: target.filterId, text })
  } else if (target.field === 'question') {
    wordings.push({ op: 'variantQuestion', filterId: target.filterId, variantName, text })
  } else if (target.field === 'explanation') {
    wordings.push({ op: 'variantExplanation', filterId: target.filterId, variantName, text })
  } else {
    wordings.push({
      op: 'optionName',
      filterId: target.filterId,
      variantName,
      optionId: target.optionId ?? '',
      text,
    })
  }

  return { wordings }
}

const WordingEditPopover = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { target, closeTarget, editingVersionId, notifySaved } = useFilterEditMode()
  const [text, setText] = useState<LocalizedText>(emptyLocalized)
  const [picked, setPicked] = useState<PickedTarget | null>(null)

  useEffect(() => {
    if (!target) {
      return
    }

    setText(target.current)
    setPicked(isVariantField(target) ? null : { mode: 'existing', variantName: target.variantName })
  }, [target])

  const pickTarget = (next: PickedTarget) => {
    if (!target) {
      return
    }
    setPicked(next)
    if (next.mode === 'existing') {
      const variant = target.filterVariants.find(candidate => candidate.name === next.variantName)
      setText(textForVariant(target, variant))
    } else {
      setText(target.current)
    }
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

  const currentVariant = target.filterVariants.find(variant => variant.name === target.variantName)
  const currentVariantLabel = currentVariant ? describeVariant(currentVariant, t) : target.variantName
  const pickedVariant =
    picked?.mode === 'existing' ? target.filterVariants.find(variant => variant.name === picked.variantName) : undefined

  const popover = (
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

        {picked === null ? (
          <VariantTargetChoice
            filterVariants={target.filterVariants}
            currentVariantName={target.variantName}
            variantQuery={target.variantQuery}
            onPick={pickTarget}
          />
        ) : (
          <Box>
            {pickedVariant && isCatchAll(pickedVariant) && (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                {t('v2:filterWordings.popover.defaultWarning')}
              </Alert>
            )}
            <Stack spacing={1.5}>
              {LANGUAGES.map(language => (
                <TextField
                  key={language}
                  size="small"
                  multiline
                  minRows={2}
                  label={t(`v2:filterWordings.popover.language.${language}`)}
                  value={text[language] ?? ''}
                  onChange={event => setText(current => ({ ...current, [language]: event.target.value }))}
                />
              ))}
              {save.isError && <Alert severity="error">{t('v2:filterWordings.popover.saveFailed')}</Alert>}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <BlackOutlinedButton type="button" onClick={closeTarget} disabled={save.isPending}>
                  {t('v2:filterWordings.popover.cancel')}
                </BlackOutlinedButton>
                <BlackContainedButton
                  type="button"
                  onClick={() => save.mutate()}
                  disabled={save.isPending}
                  startIcon={save.isPending ? <CircularProgress size={16} /> : null}
                >
                  {t('v2:filterWordings.popover.save')}
                </BlackContainedButton>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Popover>
  )

  return popover
}

export default WordingEditPopover
