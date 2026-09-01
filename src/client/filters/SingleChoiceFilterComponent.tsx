import { RadioGroup } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Option, Question } from '../../common/types'
import AppMarkdown from '../components/common/AppMarkdown'
import HyAccordion from '../components/common/hy/HyAccordion'
import SingleChoiceOption from '../components/common/SingleChoiceOption'
import { useFilterContext } from '../contexts/filterContext'

interface SingleChoiceFilterComponentProps {
  filter: Question
  state: string
  handleRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: Option[]
  extrainfo?: string
}

const SingleChoiceFilterComponent: React.FC<SingleChoiceFilterComponentProps> = ({
  filter,
  state,
  handleRadioChange,
  options,
  extrainfo, // Destructure extrainfo
}) => {
  const { t } = useTranslation()
  const [accordionOpen, setAccordionOpen] = useState(false)
  const { getOptionCount } = useFilterContext()

  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // aria-disabled options stay focusable, so reject the selection here instead
    if (getOptionCount(filter.id, event.target.value) === 0) {
      return
    }
    handleRadioChange(event) // Call the passed handler
    // Assuming '1' is the ID for the 'yes' option
    setAccordionOpen(event.target.value === '1' && !!extrainfo)
  }

  return (
    <>
      <RadioGroup
        name={filter.id}
        value={state}
        onChange={onRadioChange}
        aria-labelledby={`question-text-${filter.id}`}
      >
        {options.map(option => (
          <SingleChoiceOption
            key={option.id}
            option={option}
            filterId={filter.id}
            count={getOptionCount(filter.id, option.id)}
          />
        ))}
      </RadioGroup>

      {extrainfo && state === '1' && (
        <HyAccordion
          open={accordionOpen}
          onChange={setAccordionOpen}
          variant="compact"
          headingLevel={3}
          summary={t('question:extrainfo')}
        >
          <AppMarkdown>{extrainfo}</AppMarkdown>
        </HyAccordion>
      )}
    </>
  )
}

export default SingleChoiceFilterComponent
