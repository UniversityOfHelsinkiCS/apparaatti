import {
  Box,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatLocalizedCourseName } from '../../../../common/nameFormatter.ts'
import type { CourseTag, LocalizedString } from '../../../../common/types.ts'
import useApi from '../../../util/useApi.tsx'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { CourseSearchValues } from '../courseSearchQuery.ts'
import {
  buildCourseQueryString,
  courseSearchCacheKey,
  courseSearchValuesFromFields,
  emptyCourseSearchValues,
} from '../courseSearchQuery.ts'
import type { CoursesSearchFieldsValues } from '../CoursesSearchFields.tsx'
import CoursesSearchFields from '../CoursesSearchFields.tsx'
import BulkApplyDialog from './BulkApplyDialog.tsx'
import type { CurTagMutationMode } from './courseTagUtils.ts'
import { fetchCurTagStates, saveCurTag } from './courseTagUtils.ts'
import type { TagCellState } from './TagCell.tsx'
import TagCell from './TagCell.tsx'

const PAGE_SIZE = 50

interface Course {
  id: string
  name: LocalizedString
  nameSpecifier: LocalizedString
}

interface PaginatedCoursesResponse {
  courses: Course[]
  total: number
  totalPages: number
}

const nextMode = (state: TagCellState): CurTagMutationMode => {
  if (state === 'inherited') return 'ignore'
  if (state === 'added') return 'clear'
  if (state === 'ignored') return 'clear'
  return 'add'
}

interface CurTagMatrixProps {
  tags: CourseTag[]
}

const CurTagMatrix = ({ tags }: CurTagMatrixProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  const handleSearch = (fields: CoursesSearchFieldsValues) => {
    setSearchValues(courseSearchValuesFromFields(fields))
    setPage(1)
  }

  const { data: coursesData, isLoading } = useApi<PaginatedCoursesResponse>(
    `course-tags-courses-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/courses?${buildCourseQueryString(searchValues, page, PAGE_SIZE)}`,
    'GET',
    undefined
  )

  const courses = coursesData?.courses ?? []
  const curIds = courses.map(course => course.id)
  const tagStateKey = ['course-tag-states', curIds.join(',')]

  const { data: tagStates } = useQuery({
    queryKey: tagStateKey,
    queryFn: () => fetchCurTagStates(curIds),
    enabled: curIds.length > 0,
  })

  const stateFor = (curId: string, tagKey: string): TagCellState => {
    const tag = tagStates?.find(state => state.curId === curId)?.tags.find(entry => entry.key === tagKey)
    return tag?.source ?? 'unset'
  }

  const handleToggle = async (curId: string, tagKey: string) => {
    await saveCurTag(curId, tagKey, nextMode(stateFor(curId, tagKey)))
    await queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })
  }

  const refreshTagStates = () => queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })

  return (
    <Box>
      <CoursesSearchFields onSearch={handleSearch} />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
        <BlackOutlinedButton type="button" onClick={() => setIsBulkOpen(true)}>
          {t('v2:courseTags.bulk.open')}
        </BlackOutlinedButton>
        <Typography variant="body2">{t('v2:courseTags.matched', { count: coursesData?.total ?? 0 })}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('v2:courseTags.legend')}
        </Typography>
      </Stack>

      {isLoading ? (
        <Typography>{t('v2:admin.loading')}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('v2:courseTags.course')}</TableCell>
              {tags.map(tag => (
                <TableCell key={tag.key} align="center">
                  <Tooltip title={tag.description ?? tag.key}>
                    <span>{tag.key}</span>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map(course => (
              <TableRow key={course.id} hover>
                <TableCell>{formatLocalizedCourseName(course)}</TableCell>
                {tags.map(tag => (
                  <TableCell key={tag.key} align="center">
                    <TagCell
                      tagKey={tag.key}
                      description={tag.description}
                      state={stateFor(course.id, tag.key)}
                      onClick={() => handleToggle(course.id, tag.key)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={coursesData?.totalPages ?? 1}
          page={page}
          onChange={(_event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <BulkApplyDialog
        open={isBulkOpen}
        tags={tags}
        searchValues={searchValues}
        onClose={() => setIsBulkOpen(false)}
        onApplied={refreshTagStates}
      />
    </Box>
  )
}

export default CurTagMatrix
