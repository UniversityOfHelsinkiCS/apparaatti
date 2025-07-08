import { Button, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'




const QuestionTitle = ({handleOpen, title}: {handleOpen: () => void, title: string | undefined}) => {
  return (
    <Typography gutterBottom sx={{ fontSize: '1rem', width: 'auto' }}>
      <Button onClick={handleOpen} style={{ color: 'black' }}>
        <InfoIcon></InfoIcon>
      </Button>
      {title}
    </Typography>
  )  
}



export default QuestionTitle
