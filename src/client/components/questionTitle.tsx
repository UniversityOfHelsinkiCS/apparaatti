import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'




const QuestionTitle = ({handleOpen, title}: {handleOpen: () => void, title: string | undefined}) => {
  return (
    <Stack direction='row' sx={{display: 'flex'}}>
      <Typography gutterBottom sx={{ fontSize: '1rem', width: 'auto' }}>
        <IconButton onClick={handleOpen} aria-label='more info' sx={{paddingLeft: 0}}>
          <InfoIcon></InfoIcon> 
        </IconButton>
        {title}
      </Typography>
    </Stack>
  )  
}



export default QuestionTitle
