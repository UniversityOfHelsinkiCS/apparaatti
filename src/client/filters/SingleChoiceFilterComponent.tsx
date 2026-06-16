import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Question, Option } from '../../common/types'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import { useFilterContext } from '../contexts/filterContext'
import RadioButtonGroup from '../components/common/RadioButtonGroup'

interface SingleChoiceFilterComponentProps {
  filter: Question
  state: string
  handleRadioChange: (value: string) => void
  options: Option[]
  extrainfo?: string
}

const SingleChoiceFilterComponent: React.FC<SingleChoiceFilterComponentProps> = ({
  filter,
  state,
  handleRadioChange,
  options,
  extrainfo,
}) => {
  const { t } = useTranslation()
  const [accordionOpen, setAccordionOpen] = useState(false)
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
    // Assuming '1' is the ID for the 'yes' option
    setAccordionOpen(value === '1' && !!extrainfo)
  }

  return (
    <>
      <RadioButtonGroup name={filter.id} value={state} options={radioOptions} onChange={handleChange} />

      {extrainfo && state === '1' && (
        <Accordion
          expanded={accordionOpen}
          onChange={() => setAccordionOpen(!accordionOpen)}
          data-cy={`${filter.id}-extrainfo-accordion`}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`${filter.id}-extrainfo-accordion-summary`}>
            <Typography>{t('question:extrainfo')}: </Typography>
          </AccordionSummary>
          <AccordionDetails data-cy={`${filter.id}-extrainfo-accordion-details`}>
            <Markdown>{extrainfo}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  )
}

export default SingleChoiceFilterComponent
