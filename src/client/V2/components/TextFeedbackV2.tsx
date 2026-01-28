import { Box, Button, Typography, Modal, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import TextField from '@mui/material/TextField'
import { CourseRecommendations } from '../../../common/types'
import { useState } from 'react'
import { useFilterContext } from '../filterContext'

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

  const {uiVariant, setUiVariant} = useFilterContext()

  const periodYearVariant = uiVariant.find((v) => v.name == 'period-year-variant')?.value
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

  const setUI = (name, value) => {
    const newState = uiVariant.map((u) => u.name === name ? {...u, value: value } : u)
    setUiVariant(newState)
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <Box sx={style}>

        <FormControl fullWidth>
          <InputLabel id="my-select-label">Periodin ja Lukuvuoden esitysmuoto</InputLabel>

          <Select labelId="my-select-label" value={periodYearVariant} label="Choose" onChange={(e) => {setUI('period-year-variant', e.target.value)}}>
            <MenuItem value={'year-visible'}>
         Lukuvuosi näytetty
            </MenuItem>
            <MenuItem value={'year-hidden'}>
           Lukuvuosi piilossa
            </MenuItem>
          </Select>
        </FormControl>

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
