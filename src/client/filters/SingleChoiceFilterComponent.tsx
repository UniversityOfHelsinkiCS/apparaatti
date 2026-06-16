import React from 'react'
import { Question, Option } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'
import RadioButtonGroup from '../components/common/RadioButtonGroup'

interface SingleChoiceFilterComponentProps {
  filter: Question
  state: string
  handleRadioChange: (value: string) => void
  options: Option[]
}

const SingleChoiceFilterComponent: React.FC<SingleChoiceFilterComponentProps> = ({
  filter,
  state,
  handleRadioChange,
  options,
}) => {
  const { getOptionCount } = useFilterContext()

  const radioOptions = options.map(o => {
    const count = getOptionCount(filter.id, o.id)
    return {
      id: o.id,
      label: count != null ? `${o.name} (${count})` : o.name,
      disabled: count === 0,
    }
  })

  const handleChange = (value: string) => {
    handleRadioChange(value)
  }

  return <RadioButtonGroup name={filter.id} value={state} options={radioOptions} onChange={handleChange} />
}

export default SingleChoiceFilterComponent
