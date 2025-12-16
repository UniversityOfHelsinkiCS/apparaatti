import { useState } from 'react'
import { Question } from '../../../common/types'
import QuestionTitleV2 from '../components/QuestionTitleV2'
import ExtraInfoModalV2 from '../components/ExtraInfoModalV2'
import { pickVariant } from '../../hooks/useQuestions'
import { Box } from '@mui/material'
import MultiChoiceFilterComponent from './MultiChoiceFilterComponent'
import SingleChoiceFilterComponent from './SingleChoiceFilterComponent'
import DropdownFilterComponent from './DropdownFilterComponent'

/*
 a filter can be multichoice, single choice, or a drop down menu it can be read from the filter object 
*/
const Filter = ({ filter, state, setState }: { filter: Question, state: any, setState: any }) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = pickVariant(filter, 'default')

  if (!variant || variant.skipped) {
    return null
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    const isChecked = event.target.checked

    if (isChecked) {
      setState([...state, optionId])
    } else {
      setState(state.filter((id: string) => id !== optionId))
    }
  }

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState(event.target.value)
  }

  return (
    <Box
      sx={{
        paddingTop: 1,
      }}
    >
      <QuestionTitleV2 number={filter.number} handleOpen={handleOpen} title={variant.question} question={filter} />
      <ExtraInfoModalV2 question={filter} open={open} handleClose={handleClose} />

      {(() => {
        switch (filter.displayType) {
        case 'multichoice':
          return (
            <MultiChoiceFilterComponent
              filter={filter}
              state={state}
              handleCheckboxChange={handleCheckboxChange}
              options={variant.options || []}
            />
          )
        case 'dropdownselect':
          return (
            <DropdownFilterComponent
              filter={filter}
              state={state}
              handleChange={handleDropdownChange}
              options={variant.options || []}
            />
          )
        case 'singlechoice':
        default:
          return (
            <SingleChoiceFilterComponent
              filter={filter}
              state={state}
              handleRadioChange={handleRadioChange}
              options={variant.options || []}
            />
          )
        }
      })()}
    </Box>
  )
}

export default Filter
