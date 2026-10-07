import { Alert, Box, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, CourseUnitGroup } from '../../../../common/types.ts'
import useApi from '../../../util/useApi.tsx'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import {
  buildCourseQueryString,
  courseSearchCacheKey,
  courseSearchValuesFromFields,
  emptyCourseSearchValues,
} from '../courseSearchQuery.ts'
import type { CoursesSearchFieldsValues } from '../CoursesSearchFields.tsx'
import CoursesSearchFields from '../CoursesSearchFields.tsx'
import { invalidateTagQueries, saveCourseUnitTag } from './courseTagUtils.ts'
import CuTagTable from './CuTagTable.tsx'
import TagMatrixPagination from './TagMatrixPagination.tsx'

const PAGE_SIZE = 50

interface CourseUnitsResponse {
  groups: CourseUnitGroup[]
  total: number
  totalPages: number
}

interface CuTagTabProps {
  tags: CourseTag[]
}

const CuTagTab = ({ tags }: CuTagTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)

  const handleSearch = (fields: CoursesSearchFieldsValues) => {
    setSearchValues(courseSearchValuesFromFields(fields))
    setPage(1)
  }

  const { data, isLoading } = useApi<CourseUnitsResponse>(
    `course-tag-cu-states-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/course-tags/course-units?${buildCourseQueryString(searchValues, page, PAGE_SIZE)}`,
    'GET',
    undefined
  )

  const groups = useMemo(() => data?.groups ?? [], [data])

  const tagKeysByCourseCode = useMemo(() => {
    const index = new Map<string, Set<string>>()
    for (const group of groups) {
      index.set(group.courseCode, new Set(group.tagKeys))
    }
    return index
  }, [groups])

  const handleToggle = useCallback(
    async (courseCode: string, tagKey: string) => {
      const hasTag = tagKeysByCourseCode.get(courseCode)?.has(tagKey) ?? false
      await saveCourseUnitTag(courseCode, tagKey, !hasTag)
      await invalidateTagQueries(queryClient)
    },
    [tagKeysByCourseCode, queryClient]
  )

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('v2:courseTags.cu.explanation')}
      </Alert>

      <CoursesSearchFields onSearch={handleSearch} autoSearch />

      <Typography variant="body2" sx={{ mb: 1, color: '#374151' }}>
        {t('v2:courseTags.cu.matched', { count: data?.total ?? 0 })}
      </Typography>

      {isLoading ? (
        <Typography>{t('v2:admin.loading')}</Typography>
      ) : (
        <CuTagTable groups={groups} tags={tags} tagKeysByCourseCode={tagKeysByCourseCode} onToggle={handleToggle} />
      )}

      <TagMatrixPagination count={data?.totalPages ?? 1} page={page} onChange={setPage} />
    </Box>
  )
}

export default CuTagTab
