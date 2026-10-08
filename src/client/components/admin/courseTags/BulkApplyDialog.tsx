import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, TagBase } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import BulkModeRadioGroup from './BulkModeRadioGroup.tsx'
import BulkTagSelect from './BulkTagSelect.tsx'
import type { CurTagMutationMode } from './courseTagUtils.ts'
import { previewBulkApply } from './courseTagUtils.ts'

interface BulkApplyDialogProps {
  open: boolean
  tags: CourseTag[]
  base: TagBase
  searchValues: CourseSearchValues
  onClose: () => void
  onApply: (curIds: string[], tagKeys: string[], mode: CurTagMutationMode) => void
}

const BulkApplyDialog = ({ open, tags, base, searchValues, onClose, onApply }: BulkApplyDialogProps) => {
  const { t } = useTranslation()
  const [selectedTags, setSelectedTags] = useState<CourseTag[]>([])
  const [mode, setMode] = useState<CurTagMutationMode>('add')
  const [preview, setPreview] = useState<{ matched: number; curIds: string[] } | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const tagKeys = selectedTags.map(tag => tag.key)
  const matched = preview?.matched ?? null

  useEffect(() => {
    if (!open || tagKeys.length === 0) {
      setPreview(null)
      return
    }

    let cancelled = false
    previewBulkApply(searchValues, base, tagKeys, mode).then(result => {
      if (!cancelled) setPreview(result)
    })
    return () => {
      cancelled = true
    }
  }, [open, tagKeys.join(','), mode, searchValues, base])

  const handleApply = () => {
    if (!preview) return
    setIsApplying(true)
    onApply(preview.curIds, tagKeys, mode)
    setIsApplying(false)
    setSelectedTags([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('v2:courseTags.bulk.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <BulkTagSelect tags={tags} selectedTags={selectedTags} onChange={setSelectedTags} />

          <BulkModeRadioGroup mode={mode} onChange={setMode} />

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
