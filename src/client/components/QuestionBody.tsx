import { Box } from '@mui/material'

import type { VariantQuery } from '../../common/conditionMatching'
import type { RenderableFilter } from '../contexts/filter/renderableFilter'
import Filter from '../filters/filter'
import { EditScopeProvider } from './editMode/editScope'
import FilterSettingsGear from './editMode/FilterSettingsGear'
import StudyPhaseQuestion from './StudyPhaseQuestion'

const QuestionBody = ({
  entry,
  variantQuery,
  scope,
}: {
  entry: RenderableFilter
  variantQuery: VariantQuery
  scope?: string
}) => {
  const { question, variant, isFallback, filterToRender } = entry

  if (question.id === 'study-field-select') {
    return (
      <EditScopeProvider
        filterId={question.id}
        variantName={variant.name}
        isFallbackVariant={isFallback}
        variantQuery={variantQuery}
        rawFilter={question.raw}
        rawVariant={variant.raw}
      >
        <Box>
          <FilterSettingsGear />
          <StudyPhaseQuestion question={question} variant={variant} variantQuery={variantQuery} scope={scope} />
        </Box>
      </EditScopeProvider>
    )
  }

  return (
    <Filter
      variant={variant}
      filter={filterToRender}
      scope={scope}
      variantName={variant.name}
      isFallbackVariant={isFallback}
      variantQuery={variantQuery}
    />
  )
}

export default QuestionBody
