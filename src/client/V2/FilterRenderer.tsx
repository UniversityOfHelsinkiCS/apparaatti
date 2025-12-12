import MultiChoiceFilter from './filters/MultiChoiceFilter'
import StudyPhaseFilter from './filters/StudyPhaseFilter'
import LanguageFilter from './filters/LanguageFilter'
import PreviouslyDoneLangFilter from './filters/PreviouslyDoneLangFilter'
import PrimaryLanguageSpecificationFilter from './filters/PrimaryLanguageSpecificationFilter'
import { useFilterContext } from './filterContext'
import StudyPlaceFilter from './filters/StudyPlaceFilter'
import { Question } from '../../common/types'

const FilterRenderer = ({ filter }: { filter: Question }) => {
  const {
    language,
    setLanguage,
    primaryLanguage,
    setPrimaryLanguage,
    primaryLanguageSpecification,
    setPrimaryLanguageSpecification,
    variantToDisplayId,
    user,
    studyData,
    supportedOrganisations,
    setUserOrgCode,
  } = useFilterContext()

  switch (filter.type) {
  case 'studyphase':
    return (
      <StudyPhaseFilter
        filter={filter}
        supportedOrganisations={supportedOrganisations}
        user={user}
        studyData={studyData}
        setUserOrgCode={setUserOrgCode}
      />
    )
  case 'multi':
    return (
      <MultiChoiceFilter filter={filter} variantId={variantToDisplayId} />
    )
  case 'primary-language':
    return (
      <LanguageFilter
        filter={filter}
        setLanguage={setPrimaryLanguage}
      />
    )
  case 'study-place':
    return (
      <StudyPlaceFilter
        filter={filter}
        variantId={variantToDisplayId}
      />
    )
  case 'primary-language-specification':
    return (
      <PrimaryLanguageSpecificationFilter
        filter={filter}
        language={language}
        primaryLanguage={primaryLanguage}
        setPrimaryLanguageSpecification={setPrimaryLanguageSpecification}
      />
    )
  case 'language':
    return (
      <LanguageFilter
        filter={filter}
        setLanguage={setLanguage}
      />
    )
  case 'previusly-done-lang':
    return (
      <PreviouslyDoneLangFilter filter={filter} languageId={language} />
    )
  default:
    // Silently fail for unknown filter types, or show a minimal indicator
    return null
  }
}

export default FilterRenderer
