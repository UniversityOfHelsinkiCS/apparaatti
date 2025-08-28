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

const QuestionTitle = ({handleOpen, title, number, question}: {handleOpen: () => void, title: string | undefined, number: string, question: Question}) => {
  return (
    <Stack sx={{marginTop: '5rem'}} data-cy={`question-title-${number}`}>
      <Stack direction='row'>
        <Typography sx={{marginRight: '1rem'}}>{number}. </Typography>
        <MandatoryStatus question={question} />
      </Stack>
      <Stack direction='row' sx={{display: 'flex', borderTop: '2px solid gray'}}>
        <Typography gutterBottom sx={{ fontSize: '1rem', width: 'auto' }} data-cy={`question-text-${number}`}>
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
