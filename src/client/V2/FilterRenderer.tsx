import { useFilterContext } from './filterContext'
import { Question } from '../../common/types'
import Filter from './filters/filter'

const FilterRenderer = ({ filter }: { filter: Question }) => {
  const {
    language,
    setLanguage,
    primaryLanguage,
    setPrimaryLanguage,
    primaryLanguageSpecification,
    setPrimaryLanguageSpecification,
    studyField,
    setStudyField,
    previouslyDoneLang,
    setPreviouslyDoneLang,
    replacement,
    setReplacement,
    mentoring,
    setMentoring,
    finmu,
    setFinmu,
    challenge,
    setChallenge,
    graduation,
    setGraduation,
    integrated,
    setIntegrated,
    independent,
    setIndependent,
    studyPlace,
    setStudyPlace,
    mooc,
    setMooc,
  } = useFilterContext()

  let state: any
  let setState: any
  let displayType: 'multichoice' | 'singlechoice' | 'dropdownselect' = 'singlechoice'

  switch (filter.id) {
    case 'study-field-select':
      state = studyField
      setState = setStudyField
      displayType = 'dropdownselect'
      break
    case 'primary-language':
      state = primaryLanguage
      setState = setPrimaryLanguage
      break
    case 'lang':
      state = language
      setState = setLanguage
      break
    case 'primary-language-specification':
      state = primaryLanguageSpecification
      setState = setPrimaryLanguageSpecification
      break
    case 'previusly-done-lang':
      state = previouslyDoneLang
      setState = setPreviouslyDoneLang
      break
    case 'replacement':
      state = replacement
      setState = setReplacement
      break
    case 'mentoring':
      state = mentoring
      setState = setMentoring
      break
    case 'finmu':
      state = finmu
      setState = setFinmu
      break
    case 'challenge':
      state = challenge
      setState = setChallenge
      break
    case 'graduation':
      state = graduation
      setState = setGraduation
      break
    case 'integrated':
      state = integrated
      setState = setIntegrated
      break
    case 'independent':
      state = independent
      setState = setIndependent
      break
    case 'study-place':
      state = studyPlace
      setState = setStudyPlace
      displayType = 'multichoice'
      break
    case 'mooc':
      state = mooc
      setState = setMooc
      break
    default:
      // Fallback for any unhandled filter types, assuming single choice
      state = ''
      setState = () => {}
      break
  }

  return (
    <Filter
      filter={{ ...filter, displayType }}
      state={state}
      setState={setState}
    />
  )
}

export default Filter
