import { IconButton, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { Question } from '../../common/types'
import MandatoryBadge from './common/MandatoryBadge'

const MandatoryStatus = ({question}: {question: Question}) => {
  if(!question.mandatory){
    return (<></>)
  }
  return(
    <MandatoryBadge />
  )
}

const QuestionTitleV2 = ({
  handleOpen,
  title,
  question,
  showMandatoryStatus = true,
}: {
  handleOpen: () => void,
  title: string | undefined,
  question: Question,
  showMandatoryStatus?: boolean,
}) => {
  return (
    <Stack sx={{marginTop: '1rem'}} data-cy={`question-title-${question.id}`}>
      {showMandatoryStatus && (
        <Stack direction='row'>
          <MandatoryStatus question={question} />
        </Stack>
      )}
      <Stack direction='row' sx={{display: 'flex'}}>
        <Typography gutterBottom sx={{ fontSize: '1rem', width: 'auto' }} data-cy={`question-text-${question.id}`}>
          <IconButton onClick={handleOpen} aria-label='more info' sx={{paddingLeft: 0}}>
            <InfoIcon></InfoIcon> 
          </IconButton>
          {title}
        </Typography>
      </Stack>
    </Stack>
  )  
}

export default QuestionTitleV2
