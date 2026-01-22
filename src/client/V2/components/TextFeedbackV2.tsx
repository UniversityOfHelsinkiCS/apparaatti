import { Box, Button, Typography, Modal } from '@mui/material'
import TextField from '@mui/material/TextField'
import { CourseRecommendations } from '../../../common/types'
import { useState } from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
} as const

type TextFeedbackV2Props = {
  open: boolean;
  onClose: () => void;
  recommendations: CourseRecommendations;
};

const TextFeedbackV2 = ({ open, onClose, recommendations }: TextFeedbackV2Props) => {
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
    onClose() // Close modal after submission
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <Box sx={style}>
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
          <Button variant="contained" color="primary" type="submit" sx={{ mr: 1 }}>Lähetä</Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>Peruuta</Button>
        </form>
      </Box>
    </Modal>
  )
}

export default TextFeedbackV2
