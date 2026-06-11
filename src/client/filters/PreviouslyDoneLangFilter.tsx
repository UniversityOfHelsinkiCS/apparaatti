import {
  Box,
  RadioGroup,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Radio,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import type { Question } from '../../common/types'
import { useTranslation } from 'react-i18next'
import { pickVariant } from '../hooks/useQuestions'
import Markdown from 'react-markdown'
import { useFilterContext } from '../contexts/filterContext'

const PreviouslyDoneLangFilter = ({ filter, languageId }: { filter: Question; languageId: string }) => {
  const { t } = useTranslation()
  const { setPreviouslyDoneLang } = useFilterContext()
  const variant = pickVariant(filter, languageId)
  const neutralOption = variant.options.find(o => o.id === 'neutral')
  const yesOption = variant.options.find(o => o.id === '1')
  const noOption = variant.options.find(o => o.id === '0')

  if (!yesOption || !noOption) {
    return <p>Unknown error on filter</p>
  }

  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [accordionOpen, setAccordionOpen] = useState(false)

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSelectedValue(value)
    setPreviouslyDoneLang(value)
    setAccordionOpen(value === yesOption.id) // Open accordion if "Yes" is selected
  }

  return (
    <Box>
      <RadioGroup name={filter.id} value={selectedValue} onChange={handleRadioChange}>
        {!!neutralOption && (
          <FormControlLabel
            value={neutralOption.id}
            data-cy={'previously-done-lang-option-neutral'}
            control={<Radio />}
            label={neutralOption.name}
          />
        )}

        <FormControlLabel
          value={yesOption.id}
          data-cy={'previously-done-lang-option-yes'}
          control={<Radio />}
          label={yesOption.name}
        />

        <FormControlLabel
          value={noOption.id}
          data-cy={'previously-done-lang-option-no'}
          control={<Radio />}
          label={noOption.name}
        />
      </RadioGroup>

      {selectedValue === yesOption.id && (
        <Accordion
          expanded={accordionOpen}
          onChange={() => setAccordionOpen(!accordionOpen)}
          data-cy="previously-done-lang-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy="previously-done-lang-accordion-summary">
            <Typography>{t('question:extrainfo')}: </Typography>
          </AccordionSummary>
          <AccordionDetails data-cy="previously-done-lang-accordion-details">
            <Markdown>{t('question:checkInstructionsCrediting')}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}

export default PreviouslyDoneLangFilter
