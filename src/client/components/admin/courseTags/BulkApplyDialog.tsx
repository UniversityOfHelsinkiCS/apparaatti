import {
  Alert,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import type { CurTagMutationMode } from './courseTagUtils.ts'
import { applyBulkTags, previewBulkApply } from './courseTagUtils.ts'

interface BulkApplyDialogProps {
  open: boolean
  tags: CourseTag[]
  searchValues: CourseSearchValues
  onClose: () => void
  onApplied: () => void
}

const BulkApplyDialog = ({ open, tags, searchValues, onClose, onApplied }: BulkApplyDialogProps) => {
  const { t } = useTranslation()
  const [selectedTags, setSelectedTags] = useState<CourseTag[]>([])
  const [mode, setMode] = useState<CurTagMutationMode>('add')
  const [matched, setMatched] = useState<number | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const tagKeys = selectedTags.map(tag => tag.key)

  useEffect(() => {
    if (!open || tagKeys.length === 0) {
      setMatched(null)
      return
    }

    let cancelled = false
    previewBulkApply(searchValues, tagKeys, mode).then(result => {
      if (!cancelled) setMatched(result.matched)
    })
    return () => {
      cancelled = true
    }
  }, [open, tagKeys.join(','), mode, searchValues])

  const handleApply = async () => {
    setIsApplying(true)
    await applyBulkTags(searchValues, tagKeys, mode)
    setIsApplying(false)
    setSelectedTags([])
    onApplied()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('v2:courseTags.bulk.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            multiple
            autoHighlight
            selectOnFocus
            handleHomeEndKeys
            disableCloseOnSelect
            options={tags}
            value={selectedTags}
            onChange={(_event, value) => setSelectedTags(value)}
            getOptionLabel={tag => tag.key}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
            renderInput={params => (
              <TextField
                {...params}
                label={t('v2:courseTags.bulk.tags')}
                helperText={t('v2:courseTags.bulk.tagsHint')}
              />
            )}
          />

          <RadioGroup value={mode} onChange={event => setMode(event.target.value as CurTagMutationMode)}>
            {(['add', 'ignore', 'clear'] as const).map(option => (
              <FormControlLabel
                key={option}
                value={option}
                control={
                  <Radio sx={{ color: '#374151', alignSelf: 'flex-start', '&.Mui-checked': { color: '#111827' } }} />
                }
                sx={{ alignItems: 'flex-start', mb: 1, mr: 0 }}
                label={
                  <Box sx={{ pt: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {t(`v2:courseTags.bulk.mode.${option}.label`)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {t(`v2:courseTags.bulk.mode.${option}.description`)}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          <Alert severity="info">
            {t('v2:courseTags.bulk.explanation')} {t('v2:courseTags.bulk.newTagNote')}
          </Alert>

          <Typography variant="body2">
            {matched === null
              ? t('v2:courseTags.bulk.previewPending')
              : t('v2:courseTags.bulk.previewCount', { count: matched })}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose}>
          {t('v2:courseTags.cancel')}
        </BlackOutlinedButton>
        <BlackOutlinedButton
          type="button"
          onClick={handleApply}
          disabled={matched === null || matched === 0 || isApplying || tagKeys.length === 0}
        >
          {t('v2:courseTags.bulk.confirm', { count: matched ?? 0 })}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default BulkApplyDialog
