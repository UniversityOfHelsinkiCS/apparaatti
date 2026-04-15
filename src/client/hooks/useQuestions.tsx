import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Question, Variant, FilterConfig } from '../../common/types'
import useApi from '../util/useApi'
import { toQuestion } from '../util/filterConfigAdapter'

export const pickVariant = (question: Question, variantId: string) => {
  const hit = question.variants.find((v)=> v.name === variantId)
  if(hit){
    return hit
  }

  const fallback = question.variants.find((v) => v.name === 'default')
  return fallback
}




export const variantLookUp: Map<{language: string, primaryLanguage: string, primaryLanguageSpecification: string}, string> = new Map([
  [{ language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'written' }, 'fi_primary_written'],
  [{ language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'spoken' }, 'fi_primary_spoken'],
  [{ language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'writtenAndSpoken' }, 'fi_primary_written'],
  [{ language: 'fi', primaryLanguage: 'sv', primaryLanguageSpecification: '' }, 'fi_secondary_any'],
  [{ language: 'en', primaryLanguage: '', primaryLanguageSpecification: '' }, 'en_secondary_any'],
  [{ language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: 'spoken' }, 'sv_primary_spoken'],
  [{ language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: 'written' }, 'sv_primary_written'],
  [{ language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: '' }, 'sv_primary_any'],
  [{ language: 'sv', primaryLanguage: 'fi', primaryLanguageSpecification: '' }, 'sv_secondary_any'],
  [{ language: 'sv', primaryLanguage: 'en', primaryLanguageSpecification: '' }, 'sv_secondary_any'],
])

export const pickQuestionExplanation = (variantId: string | undefined, question: Question, t) => {
  if(variantId){
    const explanationVariant = question.variants.find((v) => v.name === variantId)
    if(explanationVariant?.explanation){
      return explanationVariant.explanation
    }
  }

  return question.explanation || t('question:noExtrainfo')
}

const checkVarianLookUpParam = (cmpr: string, shouldBe: string) => {
  if(shouldBe === ''){
    return true
  }
  return cmpr === shouldBe
}
export const getOptionDisplayTexts = (variant: Variant | null, valueId: string | string[]): string[] => {

  const values = Array.isArray(valueId) == true ? valueId : [valueId]
  const options = variant?.options
  if(!variant || !options){
    return values
  }

  const texts = []
  for(const value of values){
    
    const option = options.find((o) => o.id === value)
    if(option)
    {
      texts.push(option.name)
    }
  }

  if(texts.length == 0){
    return values
  }

  return texts
}
export const updateVariantToDisplayId = (language: string, primaryLanguage: string, primaryLanguageSpecification: string): string => {
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

const useQuestions = (): { filters: Question[]; isLoading: boolean } => {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'fi'

  const { data, isLoading } = useApi('filter-config', '/api/filter-config', 'GET', undefined)

  const filters = useMemo<Question[]>(
    () => (data ? (data as FilterConfig[]).map((cfg) => toQuestion(cfg, lang)) : []),
    [data, lang]
  )

  return { filters, isLoading }
}

export default useQuestions
