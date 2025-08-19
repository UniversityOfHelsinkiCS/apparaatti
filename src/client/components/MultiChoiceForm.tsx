import React, { useEffect, useRef, useState } from 'react'
import { Box, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PeriodQuestion from './PeriodQuestion.tsx'
import PreviuslyDoneLangQuestion from './PreviouslyDoneLangQuestion.tsx'
import ActionButton from './actionButton.tsx'
import { User } from '../../common/types.ts'
import PrimaryLanguageSpecificationQuestion from './PrimaryLanguageSpecification.tsx'
import useQuestions from '../hooks/useQuestions.tsx'

const MultiChoiceForm = ({
  onSubmit,
  studyData,
  display,
  user,
  supportedOrganisations
}: {
  onSubmit: (formData: FormData) => Promise<void>
  studyData: any,
  display: boolean,
  user: User,
  supportedOrganisations: any
}) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [language, setLanguage] = useState('')
  const questions = useQuestions()
  console.log(questions)
  const renderFormQuestion = (key, question) => {
    switch (question.type) {
    case 'date':
      //console.log('date')
      return <DateQuestion key={key} question={question} />
    case 'multi':
      //console.log("multi")
      return (
        <FormQuestion key={key} question={question} languageId={language} />
      )

    case 'primary-language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setPrimaryLanguage}
        />
      )
    case 'primary-language-specification':
      return (
        <PrimaryLanguageSpecificationQuestion
          key={key}
          question={question}
          language={language}
          primaryLanguage={primaryLanguage}
        />
      )
    case 'language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setLanguage}
        />
      )
    case 'period-date':
      return (
        <PeriodQuestion key={key} question={question} />
      )
    case 'previusly-done-lang':
      return (
        <PreviuslyDoneLangQuestion key={key} question={question} languageId={language}></PreviuslyDoneLangQuestion>
      )
    default:
      return <p>Unknown question type</p>
    }
  }
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault()
    const formData = new FormData(ev.currentTarget)
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          display: display === true ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          gap: 0,
          backgroundColor: 'white',
        }}
      >
        <FormControl component="fieldset">
          <StudyPhaseQuestion supportedOrganisations={supportedOrganisations} user={user} studyData={studyData} />
          {questions.map((q) => renderFormQuestion(q.id, q))}
        </FormControl>
        <ActionButton text="Lähetä"/>
         
      </Box>
    </form>
  )
}

export default MultiChoiceForm
