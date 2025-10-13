import React, { useEffect, useState } from 'react'
import { Box, FormControl, Typography } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PeriodQuestion from './PeriodQuestion.tsx'
import PreviuslyDoneLangQuestion from './PreviouslyDoneLangQuestion.tsx'
import ActionButton from './actionButton.tsx'
import { User } from '../../common/types.ts'
import PrimaryLanguageSpecificationQuestion from './PrimaryLanguageSpecification.tsx'
import useQuestions from '../hooks/useQuestions.tsx'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import SkippedQuestion from './SkippedQuestion.tsx'

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
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] = useState('')
  const [language, setLanguage] = useState('')
  const [variantToDisplayId, setVariantToDisplayId] = useState('default')
  const [userOrgCode, setUserOrgCode] = useState('')
  const questions = useQuestions()
   
  const { data: organisationsWithIntegrated, isLoading: isIntegratedLoading } = useQuery({
    queryKey: ['integrated'],
    queryFn: async () => {
      const res = await fetch('/api/organisations/integrated')
      return res.json()
    },
  })


  const variantLookUp: Map<{language: string, primaryLanguage: string, primaryLanguageSpecification: string}, string> = new Map([
    [{language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'written' }, 'fi_primary_written'],
    [{language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'spoken' }, 'fi_primary_spoken'],
  ])
  const checkVarianLookUpParam = (cmpr: string, shouldBe: string) => {
    //if shouldBe is an empty string it is intended as 'anything is allowed for this'
    if(shouldBe === ''){
      return true
    }
    return cmpr === shouldBe
  }
  // variant display is the different wording of a question given different choices of language, primary language and primary language specification
  const updateVariantToDisplayId = (): string => {
   for(const key of variantLookUp.keys()){
     if(checkVarianLookUpParam(language, key.language) &&
       checkVarianLookUpParam(primaryLanguage, key.primaryLanguage) &&
       checkVarianLookUpParam(primaryLanguageSpecification, key.primaryLanguageSpecification)
     ){
       return variantLookUp.get(key) || 'default'
     }
   }
   return 'default'
  }
  useEffect(() => {
    const newVariantId = updateVariantToDisplayId()
    setVariantToDisplayId(newVariantId)
  }, [language, primaryLanguage, primaryLanguageSpecification])

  const renderFormQuestion = (key, question, additionalInfo) => {
    switch (question.type) {
    case 'studyphase':
      return  <StudyPhaseQuestion key={key} question={question} supportedOrganisations={supportedOrganisations} user={user} studyData={studyData} setUserOrgCode={setUserOrgCode} />
    case 'multi':
      if(question.id === 'integrated'){
        if(additionalInfo.organisationsWithIntegrated.includes(userOrgCode)){
          return (
            <FormQuestion key={key} question={question} questionVariantId={variantToDisplayId}/>
          )
        }else{
          return <SkippedQuestion key={key} question={question}/>
        }

      }
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

    //is the language course for speaking or writing?
    case 'primary-language-specification':
      return (
        <PrimaryLanguageSpecificationQuestion
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
  if(isIntegratedLoading){
    return (<Typography>loading...</Typography>)
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
          {questions.map((q) => renderFormQuestion(q.id, q, {organisationsWithIntegrated}))}
        </FormControl>
        <ActionButton text={t('app:send')} dataCy="submit-form"/>
         
      </Box>
    </form>
  )
}

export default MultiChoiceForm
