import { Box, Typography, Modal } from '@mui/material'
import TextField from '@mui/material/TextField'
import { CourseRecommendations } from '../../common/types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useApi from '../util/useApi.tsx'
import BlackOutlinedButton from './common/BlackOutlinedButton.tsx'
import FormSubmitActions from './common/FormSubmitActions.tsx'

const style = {
  position: 'absolute',
  top: { xs: 0, md: '50%' },
  left: { xs: 0, md: '50%' },
  transform: { xs: 'none', md: 'translate(-50%, -50%)' },
  width: { xs: '100%', md: '50%' },
  height: { xs: '100%', md: 'auto' },
  minHeight: { md: '80vh' },
  bgcolor: 'background.paper',
  color: 'black',
  border: { xs: 'none', md: '2px solid #000' },
  boxShadow: { xs: 0, md: 24 },
  p: 4,
  overflowY: 'auto',
}

type TextFeedbackV2Props = {
  open: boolean;
  onClose: () => void;
  recommendations: CourseRecommendations;
};
const Feedback = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendations}) => {
  const { t } = useTranslation()
  const [feedback, setFeedBack] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      recommendations: recommendations,
      feedback: feedback
    }
    await fetch('api/admin/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      }
    })

    window.alert('palaute annettu')
    onClose()
  }

  return(
    <>
      <Typography id="feedback-modal-title" variant="h6" component="h2">

      Anna palautetta
      </Typography>
      <Typography id="feedback-modal-description" sx={{ mt: 2 }}>
      Anna tekstikentässä kuvaus siitä miten tulos on vääränlainen ja millainen sen kuuluisi olla.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          sx={{
            bgcolor: 'white'
          }}
          value={feedback}
          onChange={(e) => { setFeedBack(e.target.value) }}
          multiline
          minRows={5}
          label="Palaute ylläpidolle"
          variant="outlined"
          fullWidth
          margin="normal"
        ></TextField>
        <FormSubmitActions submitLabel={t('v2:feedback.send')} cancelLabel={t('v2:feedback.cancel')} onCancel={onClose} />
      </form>
    </> 
  )
}
const AdminModal = ({ open, onClose, recommendations }: TextFeedbackV2Props) => {
  const navigate = useNavigate()
  const { data: user } = useApi('user', '/api/user', 'GET', null)
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <Box sx={style}>
        <Feedback onClose={onClose} recommendations = {recommendations}/>

        <Box sx={{ mt: 3, borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', gap: 1 }}>
          <BlackOutlinedButton onClick={() => { onClose(); navigate('/admin') }}>
            Filter config
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => { onClose(); navigate('/admin/courses') }}>
            Courses
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => { onClose(); navigate('/admin/stats') }}>
            Stats
          </BlackOutlinedButton>
          {user?.isSuperuser && (
            <BlackOutlinedButton onClick={() => { onClose(); navigate('/admin/login-as') }}>
              Login as
            </BlackOutlinedButton>
          )}
        </Box>
      </Box>
    </Modal>
  )
}

export default AdminModal
