import React, { createContext, useContext, useState, ReactNode } from 'react'
import useQuestions from '../hooks/useQuestions'
import { Question } from '../../common/types'


interface FormContextType {
 language: string
 setLanguage: (s: string) => void

 primaryLanguage: string
 setPrimaryLanguage: (s: string) => void

 primaryLanguageSpecification: string
 setPrimaryLanguageSpecification: (s: string) => void

 variantToDisplayId: string
 setVariantToDisplayId: (s: string) => void

 questions: Question[]
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export const FormContextProvider = ({ children }: { children: ReactNode }) => {

  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] = useState('')
  const [language, setLanguage] = useState('')
  const [variantToDisplayId, setVariantToDisplayId] = useState('default')
  const allQuestions = useQuestions()

  const questions = allQuestions //this will be mankeled to have dynamic number based on what questions are shown at the moment


  return (
    <FormContext.Provider value={{
      language,
      setLanguage,

      primaryLanguage,
      setPrimaryLanguage,

      primaryLanguageSpecification,
      setPrimaryLanguageSpecification,

      variantToDisplayId,
      setVariantToDisplayId,

      questions
    }}>

      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
