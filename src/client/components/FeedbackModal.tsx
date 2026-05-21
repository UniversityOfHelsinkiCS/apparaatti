import { Box, Button, Modal, Rating, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type FeedbackModalProps = {
  open: boolean
  onClose: () => void
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  color: 'black',
  border: '1px solid #000',
  boxShadow: 24,
  p: 3,
}

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const { t } = useTranslation()
  const [textFeedback, setTextFeedback] = useState('')
  const [stars, setStars] = useState(0)

  const resetForm = () => {
    setTextFeedback('')
    setStars(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ textFeedback, stars }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    window.alert(t('v2:feedback.sent'))
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="user-feedback-modal-title"
      aria-describedby="user-feedback-modal-description"
    >
      <Box sx={style}>
        <Typography id="user-feedback-modal-title" variant="h6" component="h2">
          {t('v2:feedback.title')}
        </Typography>
        <Typography id="user-feedback-modal-description" sx={{ mt: 1 }}>
          {t('v2:feedback.description')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              value={textFeedback}
              onChange={(event) => setTextFeedback(event.target.value)}
              multiline
              minRows={5}
              label={t('v2:feedback.textLabel')}
              variant="outlined"
              fullWidth
              required
            />

            <Box>
              <Typography sx={{ mb: 0.5 }}>{t('v2:feedback.starsLabel')}</Typography>
              <Rating
                name="user-feedback-stars"
                value={stars}
                max={5}
                onChange={(_event, value) => setStars(value ?? 0)}
              />
              <Typography variant="body2">{stars} / 5</Typography>
            </Box>

            <Box>
              <Button variant="contained" color="primary" type="submit" sx={{ mr: 1 }}>
                {t('v2:feedback.send')}
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleClose}>
                {t('v2:feedback.cancel')}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Modal>
  )
}

export default FeedbackModal
