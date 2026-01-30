import { useEffect, useState } from 'react'
import { Variant } from '../../../common/types'
import QuestionTitleV2 from '../components/QuestionTitleV2'
import ExtraInfoModalV2 from '../components/ExtraInfoModalV2'
import { Box } from '@mui/material'
import MultiChoiceFilterComponent from './MultiChoiceFilterComponent'
import SingleChoiceFilterComponent from './SingleChoiceFilterComponent'
import DropdownFilterComponent from './DropdownFilterComponent'
import SuperToggle from '../components/SuperToggle'
import { useFilterContext } from '../filterContext'
import { optional } from 'zod'

/*
 a filter can be multichoice, single choice, or a drop down menu it can be read from the filter object 
*/
const Filter = ({ variant, filter }: { variant: Variant, filter: any }) => {
  const { strictFilters, setStrictFilters } = useFilterContext()
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const state = filter.state
  const setState = filter.setState

  // update strictFilters based on option.setStrict
  const updateStrictForOption = (optionId: string) => {
    const opt = (variant.options || []).find((o) => o.id === optionId)
    if (!opt || opt.setStrict === undefined) return
    if (opt.setStrict === true) {
      setStrictFilters((prev) => (prev.includes(filter.id) ? prev : [...prev, filter.id]))
    } else if (opt.setStrict === false) {
      setStrictFilters((prev) => prev.filter((id) => id !== filter.id))
    }
  }

  useEffect(() => {
    if (filter.superToggle === false && !strictFilters.includes(filter.id)) {
      setStrictFilters((prevStrictFilters) => [...prevStrictFilters, filter.id])
    }
    return () => {
      if (filter.superToggle === false && strictFilters.includes(filter.id)) {
        setStrictFilters((prevStrictFilters) =>
          prevStrictFilters.filter((id) => id !== filter.id)
        )
      }
    }
  }, [filter.id, filter.superToggle, setStrictFilters, strictFilters])

  if (!variant || variant.skipped) {
    return null
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    setState(optionId)
    updateStrictForOption(optionId)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    const isChecked = event.target.checked

    if (isChecked) {
      setState([...state, optionId])
      updateStrictForOption(optionId)
    } else {
      setState(state.filter((id: string) => id !== optionId))
      // If an unchecked option has setStrict === true, ensure we remove strict for this filter
      const opt = (variant.options || []).find((o) => o.id === optionId)
      if (opt && opt.setStrict === true) {
        setStrictFilters((prev) => prev.filter((id) => id !== filter.id))
      }
      // If an unchecked option has setStrict === false, we already ensure filter not in strict list
      if (opt && opt.setStrict === false) {
        setStrictFilters((prev) => prev.filter((id) => id !== filter.id))
      }
    }
  }

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const optionId = event.target.value
    setState(optionId)
    updateStrictForOption(optionId)
  }
  const showAsQuestion = true
  return (
    <Box
      sx={{
        paddingTop: 1,
      }}
    >
      {filter.superToggle !== false && <SuperToggle filterId={filter.id} />}
      {
        showAsQuestion ?
          <>
            <QuestionTitleV2 number={filter.number} handleOpen={handleOpen} title={variant.question} question={filter} />
            <ExtraInfoModalV2 question={filter} open={open} handleClose={handleClose} />
          </>
          :
          <></>
      }
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
              extrainfo={filter.extraInfo}
            />
          )
        }
      })()}
    </Box>
  )
}

export default Filter
