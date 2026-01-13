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
import { pickVariant } from '../../hooks/useQuestions'
import { useFilterContext } from '../filterContext'

const StudyPeriodFilter = ({
  filter,
}: {
  filter: Question
}) => {
  const { setStudyPeriod } = useFilterContext()
  const variant = pickVariant(filter, 'default')
  const [state, setState] = React.useState<Record<string, boolean>>({})

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = { ...state, [event.target.value]: event.target.checked }
    setState(newState)
    const selectedPeriods = Object.keys(newState).filter((key) => newState[key])
    setStudyPeriod(selectedPeriods)
  }

  return (
    <Box>
      <FormControl sx={{ m: 0, display: 'flex' }} component="fieldset" variant="standard">
        <FormGroup>
          {variant.options.map((option) => (
            <FormControlLabel
              checked={state[option.id] || false}
              key={option.id}
              name={filter.id}
              value={option.id}
              data-cy={`${filter.id}-option-${option.id}`}
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

export default StudyPeriodFilter
