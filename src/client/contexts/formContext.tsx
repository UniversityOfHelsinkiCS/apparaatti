import { createContext, useContext, useState, ReactNode } from 'react'
import useQuestions, { pickVariant } from '../hooks/useQuestions'
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

  const questionSkippedBasedOnVariant = (question: Question) => {
    const currentVariant = pickVariant(question, variantToDisplayId)
    if(currentVariant?.skipped === true ){
      return true
    }
    return false
  }

  const calculateNumbers = (questionsList: Question[]) => {
    

    let number = 1
    const questionsWithNumbers: Question[] = []
    for(const question of questionsList){
      if(!question.isSubQuestionForQuestionId){
        question.number = number.toString()
        questionsWithNumbers.push(question)
        number++
      }
      else{
        //one layer of subquestions is supported for now...
        //this part causes all the child questions to appear after one another, ill call it a feature
        // parent must exist before the children
        const parent = questionsList.find((q) => q.id === question.isSubQuestionForQuestionId)
        const allChildren = questionsList.filter((q) => q?.isSubQuestionForQuestionId === parent.id ) 
        let childNumber = 1
        for(const child of allChildren){
          child.number = parent?.number + '.' + childNumber.toString()
          questionsWithNumbers.push(child)
          childNumber++
        }
      }
    }
    return questionsWithNumbers
  }
  const fixNumberingBasedOnSkippedQuestions = (questions: Question[]) => {
    const questionsNotSkipped: Question[] = questions.filter((q) => !questionSkippedBasedOnVariant(q))
    const questionsWithNumbers = calculateNumbers(questionsNotSkipped)
    return questionsWithNumbers
  }
  const questions = fixNumberingBasedOnSkippedQuestions(allQuestions) 

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
