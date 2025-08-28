
import {
  Box,
  Typography,
} from '@mui/material'
import { Question } from '../../common/types.tsx'
import React from 'react'
import QuestionTitle from './questionTitle.tsx'
import ExtraInfoModal from './ExtraInfoModal.tsx'
import { useTranslation } from 'react-i18next'

const SkippedQuestion = ({
  question,
}: {
  question: Question
}) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const {t} = useTranslation()
  const variant = question.variants[0]
  return(
    
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle handleOpen={handleOpen} number={question.number} title={variant.question} question={question}/>
      <ExtraInfoModal question={question} open={open} handleClose={handleClose}/>
      <Typography>{t('question:skipped')}</Typography>
    </Box>
  )
}

export default SkippedQuestion
