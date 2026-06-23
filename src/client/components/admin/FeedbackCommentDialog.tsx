import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { RecommendationMetadata } from '../../../common/types.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import FeedbackMetadataDisplay from './FeedbackMetadataDisplay.tsx'

type FeedbackItem = {
  textFeedback: string
  stars: number
  date: string
  recommendationMetadata?: RecommendationMetadata | null
  appVersion?: string | null
  email?: string | null
}

type FeedbackCommentDialogProps = {
  feedback: FeedbackItem | null
  onClose: () => void
}

const FeedbackCommentDialog = ({ feedback, onClose }: FeedbackCommentDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={feedback !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('v2:feedback.admin.dialogTitle')}</DialogTitle>
      <DialogContent dividers>
        {feedback && (
          <Stack spacing={3}>
            <Typography color="text.secondary">
              {new Date(feedback.date).toLocaleString()} |{' '}
              {t('v2:feedback.admin.starsValue', { stars: feedback.stars })}
              {feedback.appVersion && ` | v${feedback.appVersion}`}
              {feedback.email && ` | ${feedback.email}`}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}>
              {feedback.textFeedback}
            </Typography>

            {feedback.recommendationMetadata && (
              <>
                <Divider />
                <FeedbackMetadataDisplay metadata={feedback.recommendationMetadata} />
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>{t('v2:feedback.admin.close')}</BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default FeedbackCommentDialog
