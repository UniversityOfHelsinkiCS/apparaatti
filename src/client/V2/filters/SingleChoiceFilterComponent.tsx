import { FormControlLabel, Radio, RadioGroup, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Question, Option } from '../../../common/types'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { useTranslation } from 'react-i18next'

interface SingleChoiceFilterComponentProps {
  filter: Question
  state: string
  handleRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: Option[]
  extrainfo?: string // Added extrainfo prop
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

  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleRadioChange(event) // Call the passed handler
    // Assuming '1' is the ID for the 'yes' option
    setAccordionOpen(event.target.value === '1' && !!extrainfo)
  }

  return (
    <>
      <RadioGroup name={filter.id} value={state} onChange={onRadioChange}>
        {options.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            data-cy={`${filter.id}-option-${option.id}`}
            control={
              <Radio
                sx={{
                  '&.Mui-checked': {
                    color: '#4caf50',
                  },
                }}
              />
            }
            label={option.name}
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
              },
            }}
          />
        ))}
      </RadioGroup>

      {extrainfo && state === '1' && ( // Conditionally render accordion
        <Accordion expanded={accordionOpen} onChange={() => setAccordionOpen(!accordionOpen)} data-cy={`${filter.id}-extrainfo-accordion`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`${filter.id}-extrainfo-accordion-summary`}>
            <Typography>{t('question:extrainfo')}: </Typography>
          </AccordionSummary>
          <AccordionDetails data-cy={`${filter.id}-extrainfo-accordion-details`}>
            <Markdown>
              {extrainfo}
            </Markdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  )
}

export default SingleChoiceFilterComponent
