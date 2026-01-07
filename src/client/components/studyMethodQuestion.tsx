
import React from 'react'
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
} from '@mui/material'
import { green } from '@mui/material/colors'
import { Question } from '../../common/types'
import QuestionTitle from './questionTitle'

import ExtraInfoModal from './ExtraInfoModal'
import { pickVariant } from '../hooks/useQuestions'

const StudyPlaceQuestion = ({ question }: { question: Question }) => {
  const [open, setOpen] = React.useState(false)
 
  const variant = pickVariant(question, 'default')
  const [state, setState] = React.useState<Record<string, boolean>>({})

  //const [ year, setYear ] = React.useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    const newState = state
    newState[event.target.value] = event.target.checked
    setState({...newState})

  }

  

  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle number={question.number} handleOpen={handleOpen} title={variant.question} question={question}/>
      <FormControl sx={{m: 0, display: 'flex'}} component="fieldset" variant="standard">
        <ExtraInfoModal question={question} open={open} handleClose={handleClose}/>
        <FormGroup>
          {variant.options.map((option) => (
            <FormControlLabel
              checked={state[option.id] as any}
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

export default StudyPlaceQuestion
