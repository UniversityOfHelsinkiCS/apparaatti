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

const PeriodQuestion = ({ question }: { question: Question }) => {
  const [open, setOpen] = React.useState(false)
 

  const [state, setState] = React.useState<Record<string, boolean>>({
    'neutral': false,
    'intensive_3_previous': false,
    'period_1': false,
    'period_2': false,
    'period_3': false,
    'period_4': false,
    'intensive_3': false,
  })

  //const [ year, setYear ] = React.useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = question.variants[0]

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(event.target.value)
    if(event.target.value === 'neutral'){
      console.log('reset')
      const newState = state
      newState['neutral'] = true
      newState['intensive_3'] = false
      newState['intensive_3_previous'] = false
      newState['period_1'] = false
      newState['period_2'] = false
      newState['period_3'] = false
      newState['period_4'] = false
      setState({...newState})
    }else{
      const newState = state
      newState['neutral'] = false
      newState[event.target.value] = event.target.checked
      setState({...newState})
    }
  }

  

  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle number={question.number} handleOpen={handleOpen} title={variant.question}/>
      <FormControl sx={{m: 0, display: 'flex'}} component="fieldset" variant="standard">
        <ExtraInfoModal question={question} open={open} handleClose={handleClose}/>
        <FormGroup>
          {question.variants[0].options.map((option) => (
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

export default PeriodQuestion
