import { Box, Button, Typography, Modal, FormControl, InputLabel, Select, MenuItem, Tabs, Tab } from '@mui/material'
import TextField from '@mui/material/TextField'
import { CourseRecommendations } from '../../../common/types'
import { useState } from 'react'
import { useFilterContext } from '../filterContext'

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
const Settings = ({onClose}: {onClose: () => void}) => {
  const {uiVariant, setUiVariant} = useFilterContext()

  const periodYearVariant = uiVariant.find((v) => v.name == 'recommendation-reasons-style')?.value
  const setUI = (name, value) => {
    const newState = uiVariant.map((u) => u.name === name ? {...u, value: value } : u)
    setUiVariant(newState)
  }

  return(
    
    <>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Kurssin suosittelun perustelun tyyli</Typography>
      <FormControl fullWidth>
        <InputLabel id="my-select-label">valitse</InputLabel>

        <Select labelId="my-select-label" value={periodYearVariant} label="Choose" onChange={(e) => {setUI('recommendation-reasons-style', e.target.value)}}>
          <MenuItem value={'question-icon'}>
               Kysymysikoni
          </MenuItem>
          <MenuItem value={'none'}>
              ei perusteluita
          </MenuItem>
        </Select>
      </FormControl>

      <Button onClick={onClose} variant="contained" color="primary" sx={{ mr: 1 }}>Valmis</Button>

    </>

  )
}


const Feedback = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendations}) => {
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
        <Button variant="contained" color="primary" type="submit" sx={{ mr: 1 }}>Lähetä</Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>Peruuta</Button>
      </form>
    </> 
  )
}
const AdminModal = ({ open, onClose, recommendations }: TextFeedbackV2Props) => {
  const [tab, setTab] = useState(0)
  const handleChange = (_, newValue) => { setTab(newValue) }
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <Box sx={style}>

        <Tabs value={tab} onChange={handleChange} centered sx={{ '& .Mui-Tabs-indicator': { display: 'none' } }}>
          <Tab sx={{backgroundColor: 'white', color: 'black', '&.Mui-selected': {color: 'black'}, border: '1px solid black'}} label="Palaute" />
          <Tab sx={{backgroundColor: 'white', color: 'black', '&.Mui-selected': {color: 'black'}, border: '1px solid black', borderLeft: 'none'}} label="Asetukset" />
        </Tabs>

        {tab === 0 ?
          <Feedback onClose={onClose} recommendations = {recommendations}/>
          : <></> }

        {tab === 1 ?
          <Settings onClose={onClose} />
          : <></> }
      </Box>
    </Modal>
  )
}

export default AdminModal
