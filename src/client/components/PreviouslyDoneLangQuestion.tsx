import { Box, RadioGroup, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { Question } from '../../common/types'
import QuestionTitle from './questionTitle'
import { useTranslation } from 'react-i18next'
import ExtraInfoModal from './ExtraInfoModal'



import FormOption from './FormOption'
import { pickVariant } from '../hooks/useQuestions'

const PreviuslyDoneLangQuestion = ({
  question,
  languageId,
}: {
  question: Question;
  languageId: string;
}) => {
  console.log('language id is: ', languageId)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const {t} = useTranslation()
  const variant = pickVariant(question, languageId)
  const neutralOption = variant.options.find((o) => o.id === 'neutral')
  const yesOption = variant.options.find((o) => o.id === '1')
  const noOption = variant.options.find((o) => o.id === '0')

  if (!yesOption || !noOption || !neutralOption) {
    return <p>Unknown error on question</p>
  }

  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [accordionOpen, setAccordionOpen] = useState(false)

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
    setAccordionOpen(event.target.value === yesOption.id) // Open accordion if "Yes" is selected
  }


  return (
    <Box sx={{
      paddingTop: 4,
    }}>
      <QuestionTitle number={question.number} handleOpen={handleOpen} title={variant.question} question={question}/>
     
      <ExtraInfoModal question={question} open={open} handleClose={handleClose} />
      
      <RadioGroup name={question.id} value={selectedValue} onChange={handleRadioChange}>
        <FormOption
          id={neutralOption.id}
          value={neutralOption.id}
          label={neutralOption.name}
          dataCy={'previously-done-lang-option-neutral'}
        />

        <FormOption
          id={yesOption.id}
          value={yesOption.id}
          label={yesOption.name}
          dataCy={'previously-done-lang-option-yes'}
        />

        <FormOption
          id={noOption.id}
          value={noOption.id}
          label={noOption.name}
          dataCy={'previously-done-lang-option-no'}
        />
      </RadioGroup>

      {selectedValue === yesOption.id && (
        <Accordion expanded={accordionOpen} onChange={() => setAccordionOpen(!accordionOpen)} data-cy="previously-done-lang-accordion">
          <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy="previously-done-lang-accordion-summary">
            <Typography>{t('question:extrainfo')}: </Typography>
          </AccordionSummary>
          <AccordionDetails data-cy="previously-done-lang-accordion-details">
            <Typography data-cy="instructions-for-crediting">
              {t('question:checkInstructionsCrediting')} <a href=' https://studies.helsinki.fi/ohjeet/artikkeli/opintojen-ja-osaamisen-hyvaksilukeminen?check_logged_in=1'>{t('question:fromHere')}</a>
            </Typography>
           
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}




export default PreviuslyDoneLangQuestion

