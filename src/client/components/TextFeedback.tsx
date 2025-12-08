import { Box, Button, Typography } from '@mui/material'
import TextField from '@mui/material/TextField'
import ActionButton from './actionButton'
import { CourseRecommendations, User } from '../../common/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import useApi from '../util/useApi'

const TextFeedback = ({recommendations}: {recommendations: CourseRecommendations}) => {
  const [feedback, setFeedBack] = useState('')
  const { data: user, isLoading: isUserLoading } = useApi('user','/api/user', 'GET', null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(e.target.value)
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
  }

  if(isUserLoading || !user?.isAdmin){
    return (
      <></>
    )
  }
  return (
    <Box sx={{
      bgcolor: 'grey.200',
      p: 3
    }}>
      <Typography>Anna tekstikentässä kuvaus siitä miten tulos on vääränlainen ja millainen sen kuuluisi olla.</Typography>
      <form onSubmit= {handleSubmit}>
        <TextField
          sx={{
            bgcolor: 'white'
          }}
          value={feedback}
          onChange = {(e) => {setFeedBack(e.target.value)}}
          multiline
          minRows = {20}
          label = "Palaute ylläpidolle"
          variant = "outlined"
          fullWidth
          margin = "normal"
        ></TextField>
        <Button variant="contained" color="primary" type="submit">lähetä</Button>

      </form>
    </Box>
  )
}



export default TextFeedback
