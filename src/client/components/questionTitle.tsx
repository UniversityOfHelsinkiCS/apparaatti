import { IconButton, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'




const QuestionTitle = ({handleOpen, title, number}: {handleOpen: () => void, title: string | undefined, number: string}) => {
  return (
    <Stack sx={{marginTop: '5rem'}}>
      <Typography>{number}. </Typography>
      <Stack direction='row' sx={{display: 'flex', borderTop: '2px solid gray'}}>
        <Typography gutterBottom sx={{ fontSize: '1rem', width: 'auto' }}>
          <IconButton onClick={handleOpen} aria-label='more info' sx={{paddingLeft: 0}}>
            <InfoIcon></InfoIcon> 
          </IconButton>
          {title}
        </Typography>
      </Stack>
    </Stack>
  )  
}



export default QuestionTitle
