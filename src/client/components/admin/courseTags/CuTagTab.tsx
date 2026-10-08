import { Alert, Box, Typography } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, CourseUnitGroup, TagBase } from '../../../../common/types.ts'
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
import CuTagTable from './CuTagTable.tsx'
import TagMatrixPagination from './TagMatrixPagination.tsx'
import { baseKey } from './tagVersionState.ts'
import { useTagMutation } from './useTagMutation.ts'

const PAGE_SIZE = 15

interface CourseUnitsResponse {
  groups: CourseUnitGroup[]
  total: number
  totalPages: number
}

interface CuTagTabProps {
  tags: CourseTag[]
  base: TagBase
  isEditable: boolean
}

const CuTagTab = ({ tags, base, isEditable }: CuTagTabProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)
  const mutate = useTagMutation(base)

  const handleSearch = (fields: CoursesSearchFieldsValues) => {
    setSearchValues(courseSearchValuesFromFields(fields))
    setPage(1)
  }

  const { data, isLoading } = useApi<CourseUnitsResponse>(
    `course-tag-cu-states-${baseKey(base)}-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/course-tags/course-units?${buildCourseQueryString(searchValues, page, PAGE_SIZE)}&base=${baseKey(base)}`,
    'GET',
    undefined
  )

  const groups = useMemo(() => data?.groups ?? [], [data])

  const tagKeysByCourseCode = useMemo(
    () => new Map(groups.map(group => [group.courseCode, new Set(group.tagKeys)])),
    [groups]
  )

  const cuIdsByCourseCode = useMemo(() => new Map(groups.map(group => [group.courseCode, group.cuIds])), [groups])

  const handleToggle = useCallback(
    (courseCode: string, tagKey: string) => {
      const hasTag = tagKeysByCourseCode.get(courseCode)?.has(tagKey) ?? false
      const cuIds = cuIdsByCourseCode.get(courseCode) ?? []
      mutate.mutate({ tags: [], cur: [], cu: [{ courseCode, cuIds, tagKey, present: !hasTag }] })
    },
    [tagKeysByCourseCode, cuIdsByCourseCode, mutate]
  )

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('v2:courseTags.cu.explanation')}
      </Alert>

      <CoursesSearchFields onSearch={handleSearch} autoSearch filterBy="tags" tagKeys={tags.map(tag => tag.key)} />

      <Typography variant="body2" sx={{ mb: 1, color: '#374151' }}>
        {t('v2:courseTags.cu.matched', { count: data?.total ?? 0 })}
      </Typography>

      {isLoading ? (
        <Typography>{t('v2:admin.loading')}</Typography>
      ) : (
        <CuTagTable
          groups={groups}
          tags={tags}
          tagKeysByCourseCode={tagKeysByCourseCode}
          isEditable={isEditable}
          onToggle={handleToggle}
        />
      )}

      <TagMatrixPagination count={data?.totalPages ?? 1} page={page} onChange={setPage} />
    </Box>
  )
}

export default CuTagTab
