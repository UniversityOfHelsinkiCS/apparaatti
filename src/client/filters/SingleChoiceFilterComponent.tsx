import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, RadioGroup, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Option, Question } from '../../common/types'
import AppMarkdown from '../components/common/AppMarkdown'
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
    handleRadioChange(event) // Call the passed handler
    // Assuming '1' is the ID for the 'yes' option
    setAccordionOpen(event.target.value === '1' && !!extrainfo)
  }

  return (
    <>
      <RadioGroup name={filter.id} value={state} onChange={onRadioChange}>
        {options.map(option => (
          <SingleChoiceOption
            key={option.id}
            option={option}
            filterId={filter.id}
            count={getOptionCount(filter.id, option.id)}
          />
        ))}
      </RadioGroup>

      {extrainfo &&
        state === '1' && ( // Conditionally render accordion
          <Accordion
            expanded={accordionOpen}
            onChange={() => setAccordionOpen(!accordionOpen)}
            data-cy={`${filter.id}-extrainfo-accordion`}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`${filter.id}-extrainfo-accordion-summary`}>
              <Typography>{t('question:extrainfo')}: </Typography>
            </AccordionSummary>
            <AccordionDetails data-cy={`${filter.id}-extrainfo-accordion-details`}>
              <AppMarkdown>{extrainfo}</AppMarkdown>
            </AccordionDetails>
          </Accordion>
        )}
    </>
  )
}

export default SingleChoiceFilterComponent
