import { IconButton, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { Question } from '../../common/types'
import { useTranslation } from 'react-i18next'

const MandatoryStatus = ({question}: {question: Question}) => {
  const {t} = useTranslation()
  if(!question.mandatory){
    return (<></>)
  }
  return(
    <Typography>{t('question:mandatory')}</Typography>
  )
}

const QuestionTitleV2 = ({handleOpen, title, question}: {handleOpen: () => void, title: string | undefined, question: Question}) => {
  return (
    <Stack sx={{marginTop: '1rem'}} data-cy={`question-title-${question.id}`}>
      <Stack direction='row'>
        <MandatoryStatus question={question} />
      </Stack>
      <Stack direction='row' sx={{display: 'flex', borderTop: '2px solid gray'}}>
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
