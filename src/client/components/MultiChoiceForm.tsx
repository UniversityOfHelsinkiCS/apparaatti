import { FormEventHandler, useEffect, useState } from 'react'
import { Box, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PreviuslyDoneLangQuestion from './PreviouslyDoneLangQuestion.tsx'
import ActionButton from './actionButton.tsx'
import { User } from '../../common/types.ts'
import PrimaryLanguageSpecification from './PrimaryLanguageSpecification.tsx'
import { updateVariantToDisplayId } from '../hooks/useQuestions.tsx'
import { useTranslation } from 'react-i18next'
import { useFormContext } from '../contexts/formContext.tsx'
import StudyPlaceQuestion from './studyMethodQuestion.tsx'

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
  const {t} = useTranslation()
  const {
    
    language,
    setLanguage,

    primaryLanguage,
    setPrimaryLanguage,

    primaryLanguageSpecification,
    setPrimaryLanguageSpecification,

    variantToDisplayId,
    setVariantToDisplayId,

    questions
  } = useFormContext()
  const [, setUserOrgCode] = useState('')
   
  useEffect(() => {
    const newVariantId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)
    setVariantToDisplayId(newVariantId)
  }, [language, primaryLanguage, primaryLanguageSpecification])

  const renderFormQuestion = (key, question) => {
    switch (question.type) {
    case 'studyphase':
      return  <StudyPhaseQuestion key={key} question={question} supportedOrganisations={supportedOrganisations} user={user} studyData={studyData} setUserOrgCode={setUserOrgCode} />
    case 'multi':
      //console.log("multi")
      return (
        <FormQuestion key={key} question={question} questionVariantId={variantToDisplayId} />
      )
    // this is for the primary language ie: what was the school language?
    case 'primary-language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setPrimaryLanguage}
        />
      )

    case 'study-place':
      return (
        <StudyPlaceQuestion
          key={key}
          question={question}
          questionVariantId={variantToDisplayId}
        />
      )
    //is the language course for speaking or writing?
    case 'primary-language-specification':
      return (
        <PrimaryLanguageSpecification
          key={key}
          question={question}
          language={language}
          primaryLanguage={primaryLanguage}
          setPrimaryLanguageSpecification={setPrimaryLanguageSpecification}
        />
      )

    // this is for the language that the user wants to search courses for
    case 'language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setLanguage}
        />
      )
    case 'previusly-done-lang':
      return (
        <PreviuslyDoneLangQuestion key={key} question={question} languageId={language}></PreviuslyDoneLangQuestion>
      )
    default:
      return <></>
    }
  }
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
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
          {questions.map((q) => renderFormQuestion(q.id, q))}
        </FormControl>
        <ActionButton text={t('app:send')} dataCy="submit-form"/>
         
      </Box>
    </form>
  )
}

export default MultiChoiceForm
