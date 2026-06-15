import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  Box,
  IconButton,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import LabeledCheckbox from './common/LabeledCheckbox'
import FormSubmitActions from './common/FormSubmitActions'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'
import { useFilterContext } from '../contexts/filterContext'

type FeedbackModalProps = {
  open: boolean
  onClose: () => void
}

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const { t } = useTranslation()
  const { finalRecommendedCourses, filterState } = useFilterContext()
  const [textFeedback, setTextFeedback] = useState('')
  const [stars, setStars] = useState(0)
  const [sendRecommendationMetadata, setSendRecommendationMetadata] = useState(false)
  const [metadataModalOpen, setMetadataModalOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const { data: versionData } = useApi<{ packageVersion: string; releaseVersion?: string }>(
    'version',
    '/api/version',
    'GET',
    undefined
  )

  const submitFeedbackMutation = useApiMutation(async (res: Response) => {
    if (!res.ok) {
      throw new Error('Feedback submission failed')
    }
  }, '/api/feedback')

  const feedbackRecommendationMetadata = {
    filterState,
    courses: finalRecommendedCourses,
  }
  const recommendationMetadataPreview = JSON.stringify(feedbackRecommendationMetadata, null, 2)

  const resetForm = () => {
    setTextFeedback('')
    setStars(0)
    setSendRecommendationMetadata(false)
  }

  const handleClose = () => {
    resetForm()
    setMetadataModalOpen(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!textFeedback.trim()) {
      return
    }

    const recommendationMetadata = sendRecommendationMetadata ? feedbackRecommendationMetadata : undefined

    const appVersion = versionData ? versionData.releaseVersion || versionData.packageVersion : undefined

    try {
      await submitFeedbackMutation.mutateAsync({ textFeedback, stars, recommendationMetadata, appVersion }, undefined)

      setSnackbarMessage(t('v2:feedback.sent'))
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      handleClose()
    } catch {
      setSnackbarMessage(t('v2:feedback.failed'))
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  return (
    <>
      <ds-modal
        ds-open={open}
        ds-heading-text={t('v2:feedback.title')}
        ds-size="large"
        ds-scrollable={true}
        ondsModalClose={handleClose}
      >
        <div slot="content">
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.25 }}>
                {t('v2:feedback.textLabel')}
              </Typography>
              <TextField
                value={textFeedback}
                onChange={event => setTextFeedback(event.target.value)}
                multiline
                minRows={7}
                variant="outlined"
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start',
                    backgroundColor: '#fbfbfc',
                  },
                }}
              />
            </Box>

            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.25 }}>
                {t('v2:feedback.starsLabel')}
              </Typography>
              <Stack spacing={1.25}>
                <Rating
                  name="user-feedback-stars"
                  value={stars}
                  max={5}
                  size="large"
                  onChange={(_event, value) => setStars(value ?? 0)}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {stars} / 5
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LabeledCheckbox
                  checked={sendRecommendationMetadata}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setSendRecommendationMetadata(event.target.checked)
                  }
                  label={t('v2:feedback.sendMetadata')}
                />
                <Tooltip title={t('v2:feedback.viewMetadata')}>
                  <IconButton
                    size="small"
                    aria-label={t('v2:feedback.viewMetadata')}
                    onClick={() => setMetadataModalOpen(true)}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <FormSubmitActions
              submitLabel={t('v2:feedback.send')}
              cancelLabel={t('v2:feedback.cancel')}
              actionGroupAriaLabel={t('v2:feedback.title')}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </Stack>
        </div>
      </ds-modal>

      <ds-modal
        ds-open={metadataModalOpen}
        ds-heading-text={t('v2:feedback.metadataDialogTitle')}
        ds-size="medium"
        ds-scrollable={true}
        ondsModalClose={() => setMetadataModalOpen(false)}
      >
        <div slot="content">
          <Stack spacing={2}>
            <Typography>{t('v2:feedback.metadataDialogDescription')}</Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                maxHeight: 360,
                overflow: 'auto',
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {recommendationMetadataPreview}
            </Box>
          </Stack>
        </div>
        <div slot="footer">
          <ds-button
            ds-text={t('v2:feedback.cancel')}
            ds-variant="secondary"
            onClick={() => setMetadataModalOpen(false)}
          />
        </div>
      </ds-modal>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default FeedbackModal
