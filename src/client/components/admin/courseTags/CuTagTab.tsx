import {
  Alert,
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
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
import {
  matrixContainerSx,
  stickyCornerCellSx,
  stickyFirstCellSx,
  stickyHeaderCellSx,
  verticalHeaderLabelSx,
} from './matrixStyles.ts'
import TagCell from './TagCell.tsx'

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
  const { t, i18n } = useTranslation()
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

  const localizedName = (group: CourseUnitGroup) =>
    group.name[i18n.language as 'fi' | 'sv' | 'en'] ?? group.name.fi ?? ''

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
        <TableContainer sx={matrixContainerSx}>
          <Table size="small" stickyHeader sx={{ width: 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={stickyCornerCellSx}>{t('v2:courseTags.cu.courseUnit')}</TableCell>
                <TableCell align="right" sx={stickyHeaderCellSx}>
                  {t('v2:courseTags.cu.realisations')}
                </TableCell>
                {tags.map(tag => (
                  <TableCell key={tag.key} align="center" sx={stickyHeaderCellSx}>
                    <Tooltip title={tag.description ?? tag.key} disableInteractive>
                      <Box component="span" sx={verticalHeaderLabelSx}>
                        {tag.key}
                      </Box>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.courseCode} hover>
                  <TableCell sx={stickyFirstCellSx}>
                    <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                      {group.courseCode} {localizedName(group)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{group.realisationCount}</TableCell>
                  {tags.map(tag => (
                    <TableCell key={tag.key} align="center" sx={{ p: 0.25 }}>
                      <TagCell
                        rowId={group.courseCode}
                        tagKey={tag.key}
                        description={tag.description}
                        state={tagKeysByCourseCode.get(group.courseCode)?.has(tag.key) ? 'added' : 'unset'}
                        onToggle={handleToggle}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={data?.totalPages ?? 1}
          page={page}
          onChange={(_event, value) => setPage(value)}
          sx={{
            '& .MuiPaginationItem-root': { color: '#374151' },
            '& .Mui-selected': { backgroundColor: '#111827 !important', color: '#ffffff' },
          }}
        />
      </Box>
    </Box>
  )
}

export default CuTagTab
