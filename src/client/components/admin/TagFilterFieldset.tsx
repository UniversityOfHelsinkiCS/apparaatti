import { useTranslation } from 'react-i18next'

import type { UrnMatchMode } from '../../../common/types.ts'
import FilterFieldset from './FilterFieldset.tsx'

interface TagFilterFieldsetProps {
  tagKeys: string[]
  includeValues: string[]
  includeMode: UrnMatchMode
  excludeValues: string[]
  excludeMode: UrnMatchMode
  onIncludeChange: (values: string[]) => void
  onIncludeModeChange: (mode: UrnMatchMode) => void
  onExcludeChange: (values: string[]) => void
  onExcludeModeChange: (mode: UrnMatchMode) => void
}

const TagFilterFieldset = ({ tagKeys, ...props }: TagFilterFieldsetProps) => {
  const { t } = useTranslation()

  const labels = {
    legend: t('v2:admin.courses.search.tagLegend'),
    include: t('v2:admin.courses.search.tagsToInclude'),
    exclude: t('v2:admin.courses.search.tagsToExclude'),
    includeOrTitle: t('v2:admin.courses.search.tagIncludeOrTitle'),
    includeAndTitle: t('v2:admin.courses.search.tagIncludeAndTitle'),
    excludeOrTitle: t('v2:admin.courses.search.tagExcludeOrTitle'),
    excludeAndTitle: t('v2:admin.courses.search.tagExcludeAndTitle'),
  }

  return <FilterFieldset idPrefix="course-tag" options={tagKeys} labels={labels} {...props} />
}

export default TagFilterFieldset
