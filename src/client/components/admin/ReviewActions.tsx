import { Alert, Box, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseReviewState } from '../../../common/types.ts'
import useApiMutation from '../../hooks/useApiMutation.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import HyCheckbox from '../common/hy/HyCheckbox.tsx'

type ReviewActionsProps = {
  curId: string
  reviewState?: CourseReviewState
  onSaved?: () => Promise<unknown> | void
}

const ReviewActions = ({ curId, reviewState, onSaved }: ReviewActionsProps) => {
  const { t } = useTranslation()
  const initialReviewed = reviewState?.reviewed === 'yes'
  const initialComment = reviewState?.comment ?? ''

  const [reviewed, setReviewed] = useState(initialReviewed)
  const [comment, setComment] = useState(initialComment)
  const [savedReviewed, setSavedReviewed] = useState(initialReviewed)
  const [savedComment, setSavedComment] = useState(initialComment)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSavedMessage, setShowSavedMessage] = useState(false)
  const saveReviewMutation = useApiMutation(async (res: Response) => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.message ?? t('v2:admin.review.saveFailed'))
    }
  }, '/api/admin/course/review')

  const isDirty = reviewed !== savedReviewed || comment !== savedComment

  const handleSave = async (nextReviewed = reviewed, nextComment = comment) => {
    setIsSaving(true)
    setErrorMessage(null)
    setShowSavedMessage(false)

    try {
      await saveReviewMutation.mutateAsync(
        {
          curId,
          reviewed: nextReviewed ? 'yes' : 'no',
          comment: nextComment,
        },
        undefined
      )

      setSavedReviewed(nextReviewed)
      setSavedComment(nextComment)

      if (onSaved) {
        await onSaved()
      }
      setShowSavedMessage(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('v2:admin.review.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  // Save comment changes after typing has paused briefly.
  useEffect(() => {
    if (comment === savedComment) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void handleSave(reviewed, comment)
    }, 2000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [comment, reviewed, savedComment])

  const handleReviewedChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextReviewed = event.target.checked
    setReviewed(nextReviewed)
    void handleSave(nextReviewed, comment)
  }

  return (
    <Stack spacing={1} sx={{ minWidth: 300, maxWidth: 360 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HyCheckbox checked={reviewed} onChange={handleReviewedChange} size="small" sx={{ p: 0.5 }} />
        <Typography variant="body2">
          {reviewed ? t('v2:admin.review.reviewed') : t('v2:admin.review.notReviewed')}
        </Typography>
        {isSaving ? <CircularProgress size={16} /> : null}
      </Box>

      <TextField
        value={comment}
        onChange={event => setComment(event.target.value)}
        placeholder={t('v2:admin.review.commentPlaceholder')}
        size="small"
        multiline
        minRows={2}
        fullWidth
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {showSavedMessage ? <Alert severity="success">{t('v2:admin.review.saved')}</Alert> : null}

      <Box>
        <BlackOutlinedButton size="small" onClick={() => void handleSave()} disabled={!isDirty || isSaving}>
          {t('v2:admin.review.saveButton')}
        </BlackOutlinedButton>
      </Box>
    </Stack>
  )
}

export default ReviewActions
