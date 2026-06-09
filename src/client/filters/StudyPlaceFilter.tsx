import React from 'react'
import { Box, FormControlLabel, FormGroup, FormControl } from '@mui/material'
import AppCheckbox from '../components/common/AppCheckbox.tsx'
import { Question } from '../../common/types'
import { pickVariant } from '../hooks/useQuestions'
import { useFilterContext } from '../contexts/filterContext'

const StudyPlaceFilter = ({ filter }: { filter: Question }) => {
  const { setStudyPlace } = useFilterContext()
  const variant = pickVariant(filter, 'default')
  const [state, setState] = React.useState<Record<string, boolean>>({})

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = { ...state, [event.target.value]: event.target.checked }
    setState(newState)
    const selectedPlaces = Object.keys(newState).filter(key => newState[key])
    setStudyPlace(selectedPlaces)
  }

  return (
    <Box>
      <FormControl sx={{ m: 0, display: 'flex' }} component="fieldset" variant="standard">
        <FormGroup>
          {variant.options.map(option => (
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
              control={<AppCheckbox onChange={handleChoice} />}
              label={option.name}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  )
}

export default StudyPlaceFilter
