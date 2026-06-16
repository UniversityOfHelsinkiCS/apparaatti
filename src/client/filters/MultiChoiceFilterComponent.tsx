import React from 'react'
import { Question, Option } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'
import CheckboxGroup from '../components/common/CheckboxGroup'

interface MultiChoiceFilterComponentProps {
  filter: Question
  state: string[]
  handleCheckboxChange: (value: string, checked: boolean) => void
  options: Option[]
}

const MultiChoiceFilterComponent: React.FC<MultiChoiceFilterComponentProps> = ({
  filter,
  state,
  handleCheckboxChange,
  options,
}) => {
  const { getOptionCount } = useFilterContext()

  const checkboxOptions = options.map(o => {
    const count = getOptionCount(filter.id, o.id)
    return {
      id: o.id,
      label: count != null ? `${o.name} (${count})` : o.name,
      checked: state.includes(o.id),
    }
  })

  return <CheckboxGroup name={filter.id} options={checkboxOptions} onChange={handleCheckboxChange} />
}

export default MultiChoiceFilterComponent
