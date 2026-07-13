import { Alert, Box, IconButton, Rating, Snackbar, Stack, Tooltip, Typography } from '@mui/material'
import { Info } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'
import useRequiredUser from '../util/useRequiredUser'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'
import HyTextArea from './common/hy/HyTextArea'
import LabeledCheckbox from './common/LabeledCheckbox'

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
  const [sendContactEmail, setSendContactEmail] = useState(false)
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
  const { user } = useRequiredUser()

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
    setSendContactEmail(false)
  }

  const handleClose = () => {
    resetForm()
    setMetadataModalOpen(false)
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const recommendationMetadata = sendRecommendationMetadata ? feedbackRecommendationMetadata : undefined

    const appVersion = versionData ? versionData.releaseVersion || versionData.packageVersion : undefined

    try {
      await submitFeedbackMutation.mutateAsync(
        { textFeedback, stars, recommendationMetadata, appVersion, sendContactEmail },
        undefined
      )

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
      <HyModal
        open={open}
        onClose={handleClose}
        title={t('v2:feedback.title')}
        size="large"
        scrollable
        footer={
          <>
            <HyButton variant="primary" colour="blue" type="submit" form="feedback-form">
              {t('v2:feedback.send')}
            </HyButton>
            <HyButton variant="secondary" colour="black" type="button" onClick={handleClose}>
              {t('v2:feedback.cancel')}
            </HyButton>
          </>
        }
      >
        <Box sx={{ py: 2 }}>
          <form id="feedback-form" onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ py: 1 }}>
              <HyTextArea
                label={t('v2:feedback.textLabel')}
                value={textFeedback}
                onChange={event => setTextFeedback(event.target.value)}
                rows={7}
                fullWidth
                required
              />

              <Box>
                <Typography variant="h6" sx={{ mb: 1.25 }}>
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

              <Stack spacing={1}>
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
                      <Info size={24} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {user?.email && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LabeledCheckbox
                        checked={sendContactEmail}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setSendContactEmail(event.target.checked)}
                        label={t('v2:feedback.sendContactEmail')}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, ml: 4 }}>
                      {t('v2:feedback.sendContactEmailInfo')}
                    </Typography>
                    {sendContactEmail && (
                      <Typography variant="body2" sx={{ mt: 0.75, ml: 4, fontWeight: 500 }}>
                        {t('v2:feedback.attachedEmail', { email: user.email })}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </Stack>
          </form>
        </Box>
      </HyModal>
      <HyModal
        open={metadataModalOpen}
        onClose={() => setMetadataModalOpen(false)}
        title={t('v2:feedback.metadataDialogTitle')}
        size="medium"
        scrollable
        footer={
          <HyButton variant="secondary" colour="black" onClick={() => setMetadataModalOpen(false)}>
            {t('v2:feedback.cancel')}
          </HyButton>
        }
      >
        <Stack spacing={2} sx={{ py: 2 }}>
          <Typography>{t('v2:feedback.metadataDialogDescription')}</Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
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
      </HyModal>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default FeedbackModal
