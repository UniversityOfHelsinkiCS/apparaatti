import { Box, Typography, Modal } from '@mui/material'
import TextField from '@mui/material/TextField'
import { CourseRecommendations } from '../../../common/types.ts'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from '../../util/useApi.tsx'
import useApiMutation from '../../hooks/useApiMutation.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import FormSubmitActions from '../common/FormSubmitActions.tsx'
import VersionBadge from '../common/VersionBadge.tsx'
import { useNavigate } from 'react-router-dom'

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
  const submitFeedbackMutation = useApiMutation(async (res: Response) => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.message ?? 'Failed to send feedback')
    }
  }, '/api/admin/feedback')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      recommendations: recommendations,
      feedback: feedback
    }
    try {
      await submitFeedbackMutation.mutateAsync(payload, undefined)
      window.alert('palaute annettu')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send feedback'
      window.alert(msg)
    }
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
        <FormSubmitActions
          submitLabel={t('v2:feedback.send')}
          cancelLabel={t('v2:feedback.cancel')}
          actionGroupAriaLabel={t('v2:feedback.title')}
          onCancel={onClose}
        />
      </form>
    </> 
  )
}
const AdminModal = ({ open, onClose, recommendations }: TextFeedbackV2Props) => {
  const { data: user } = useApi('user', '/api/user', 'GET', null)
  const navigate = useNavigate()

  

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
          <BlackOutlinedButton onClick={() => navigate('/admin')}>
            Filter config
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/courses')}>
            Courses
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/stats')}>
            Stats
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/feedback')}>
            User feedback
          </BlackOutlinedButton>
          {user?.isSuperuser && (
            <BlackOutlinedButton onClick={() => navigate('/admin/login-as')}>
              Login as
            </BlackOutlinedButton>
          )}
        </Box>
        <VersionBadge />
      </Box>
    </Modal>
  )
}

export default AdminModal
