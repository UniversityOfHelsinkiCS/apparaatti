import { useTranslation } from 'react-i18next'

import type { UniqueUrnResponse, UrnMatchMode } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import FilterFieldset from './FilterFieldset.tsx'

interface UrnFilterFieldsetProps {
  includeValues: string[]
  includeMode: UrnMatchMode
  excludeValues: string[]
  excludeMode: UrnMatchMode
  onIncludeChange: (values: string[]) => void
  onIncludeModeChange: (mode: UrnMatchMode) => void
  onExcludeChange: (values: string[]) => void
  onExcludeModeChange: (mode: UrnMatchMode) => void
}

const UrnFilterFieldset = (props: UrnFilterFieldsetProps) => {
  const { t } = useTranslation()
  const { data: urnOptions } = useApi<UniqueUrnResponse>('urns', '/api/admin/courses/urns', 'GET')

  const labels = {
    legend: t('v2:admin.courses.search.urnLegend'),
    include: t('v2:admin.courses.search.urnsToInclude'),
    exclude: t('v2:admin.courses.search.urnsToExclude'),
    includeOrTitle: t('v2:admin.courses.search.includeOrTitle'),
    includeAndTitle: t('v2:admin.courses.search.includeAndTitle'),
    excludeOrTitle: t('v2:admin.courses.search.excludeOrTitle'),
    excludeAndTitle: t('v2:admin.courses.search.excludeAndTitle'),
  }

  return <FilterFieldset idPrefix="course-urn" options={urnOptions?.codeUrns ?? []} labels={labels} {...props} />
}

export default UrnFilterFieldset
