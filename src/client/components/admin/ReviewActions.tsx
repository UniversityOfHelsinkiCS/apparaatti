import { Alert, Box, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { CourseReviewState } from '../../../common/types.ts'
import AppCheckbox from '../common/AppCheckbox'
import useApiMutation from '../../hooks/useApiMutation.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'

type ReviewActionsProps = {
  curId: string
  reviewState?: CourseReviewState
  onSaved?: () => Promise<unknown> | void
}

const ReviewActions = ({ curId, reviewState, onSaved }: ReviewActionsProps) => {
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
      throw new Error(errorData?.message ?? 'Failed to save review')
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save review')
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
        <AppCheckbox
          checked={reviewed}
          onChange={handleReviewedChange}
          size="small"
          sx={{ p: 0.5 }}
        />
        <Typography variant="body2">
          {reviewed ? 'Reviewed' : 'Not reviewed'}
        </Typography>
        {isSaving ? <CircularProgress size={16} /> : null}
      </Box>

      <TextField
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add comment"
        size="small"
        multiline
        minRows={2}
        fullWidth
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {showSavedMessage ? <Alert severity="success">Review saved</Alert> : null}

      <Box>
        <BlackOutlinedButton
          size="small"
          onClick={() => void handleSave()}
          disabled={!isDirty || isSaving}
        >
          Save review
        </BlackOutlinedButton>
      </Box>
    </Stack>
  )
}

export default ReviewActions