import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'
import useRequiredUser from '../util/useRequiredUser'
import BlackOutlinedButton from './common/BlackOutlinedButton'
import FormSubmitActions from './common/FormSubmitActions'
import LabeledCheckbox from './common/LabeledCheckbox'

type FeedbackModalProps = {
  open: boolean
  onClose: () => void
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '94vw', sm: 'min(760px, 92vw)' },
  maxHeight: '88vh',
  bgcolor: 'background.paper',
  color: 'black',
  border: '1px solid #c9ced6',
  borderRadius: 3,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
  p: { xs: 3, sm: 4 },
  overflowY: 'auto',
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
      <Modal open={open} onClose={handleClose} aria-labelledby="user-feedback-modal-title">
        <Box sx={style}>
          <Stack spacing={2.5}>
            <Typography
              id="user-feedback-modal-title"
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {t('v2:feedback.title')}
            </Typography>

            <form onSubmit={handleSubmit}>
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

                <FormSubmitActions
                  submitLabel={t('v2:feedback.send')}
                  cancelLabel={t('v2:feedback.cancel')}
                  actionGroupAriaLabel={t('v2:feedback.title')}
                  onCancel={handleClose}
                />
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Dialog open={metadataModalOpen} onClose={() => setMetadataModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('v2:feedback.metadataDialogTitle')}</DialogTitle>
        <DialogContent dividers>
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
        </DialogContent>
        <DialogActions>
          <BlackOutlinedButton onClick={() => setMetadataModalOpen(false)}>
            {t('v2:feedback.cancel')}
          </BlackOutlinedButton>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default FeedbackModal
