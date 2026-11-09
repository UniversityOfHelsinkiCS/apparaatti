import { Alert, Box, CircularProgress, Popover, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { FilterMutations, FilterWordingMutation, Language, LocalizedText } from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { invalidateFilterVersionQueries, mutateFilterSnapshot } from '../admin/filterVersions/filterSnapshotApi'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import VariantTargetChoice from './VariantTargetChoice'

const LANGUAGES: Language[] = ['fi', 'sv', 'en']

const isVariantField = (target: EditTarget) =>
  target.field === 'question' || target.field === 'explanation' || target.field === 'option'

export const wordingMutations = (target: EditTarget, text: LocalizedText, createVariant: boolean): FilterMutations => {
  const variantName = createVariant ? target.variantName : target.isFallbackVariant ? 'default' : target.variantName
  const wordings: FilterWordingMutation[] = []

  if (createVariant) {
    wordings.push({
      op: 'createVariant',
      filterId: target.filterId,
      variantName: target.variantName,
      fromVariantName: 'default',
    })
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
  const [text, setText] = useState<LocalizedText>({ fi: '', sv: '', en: '' })
  const [createVariant, setCreateVariant] = useState<boolean | null>(null)

  useEffect(() => {
    if (!target) {
      return
    }

    setText(target.current)
    setCreateVariant(isVariantField(target) && target.isFallbackVariant ? null : false)
  }, [target])

  const save = useMutation({
    mutationFn: async () => {
      if (!target || editingVersionId === null) {
        return
      }
      await mutateFilterSnapshot(editingVersionId, wordingMutations(target, text, createVariant === true))
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
            ? t('v2:filterWordings.popover.variantScope', { variant: target.variantName })
            : t('v2:filterWordings.popover.filterScope')}
        </Typography>

        {createVariant === null ? (
          <VariantTargetChoice variantName={target.variantName} onPick={setCreateVariant} />
        ) : (
          <Box>
            {createVariant === false && isVariantField(target) && target.isFallbackVariant && (
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
