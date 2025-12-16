import React from 'react'
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
} from '@mui/material'
import { green } from '@mui/material/colors'
import { Question } from '../../../common/types'
import QuestionTitleV2 from './QuestionTitleV2'
import ExtraInfoModalV2 from './ExtraInfoModalV2'
import { pickVariant } from '../../hooks/useQuestions'
import { useFilterContext } from '../filterContext'

const StudyPlaceQuestionV2 = ({ question }: { question: Question }) => {
  const [open, setOpen] = React.useState(false)
  const { studyPlace, setStudyPlace } = useFilterContext()
 
  const variant = pickVariant(question, 'default')

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    const isChecked = event.target.checked

    if (isChecked) {
      setStudyPlace([...studyPlace, optionId])
    } else {
      setStudyPlace(studyPlace.filter((id) => id !== optionId))
    }
  }

  if (!variant || variant.skipped) {
    return null
  }

  return (
    <Box
      sx={{
        paddingTop: 1,
      }}
    >
      <QuestionTitleV2 number={question.number} handleOpen={handleOpen} title={variant.question} question={question}/>
      <FormControl sx={{m: 0, display: 'flex'}} component="fieldset" variant="standard">
        <ExtraInfoModalV2 question={question} open={open} handleClose={handleClose}/>
        <FormGroup>
          {variant.options.map((option) => (
            <FormControlLabel
              checked={studyPlace.includes(option.id)}
              key={option.id}
              name={question.id}
              value={option.id}
              data-cy={`${question.id}-option-${option.id}`}
              sx={{
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                },
              }}
              control={
                <Checkbox
                  onChange={handleChoice}
                  color="default"
                  sx={{ '&.Mui-checked': { color: green[500] } }}
                />
              }
              label={option.name}
            />
          ))}
         
        </FormGroup>
      </FormControl>
    </Box>
  )
}

export default StudyPlaceQuestionV2
