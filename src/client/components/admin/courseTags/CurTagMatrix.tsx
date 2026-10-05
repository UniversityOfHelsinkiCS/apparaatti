import {
  Box,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getDisplayCourseName } from '../../../../common/nameFormatter.ts'
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
import {
  matrixContainerSx,
  stickyCornerCellSx,
  stickyFirstCellSx,
  stickyHeaderCellSx,
  verticalHeaderLabelSx,
} from './matrixStyles.ts'
import type { TagCellState } from './TagCell.tsx'
import TagCell from './TagCell.tsx'
import TagColumnPicker from './TagColumnPicker.tsx'

const PAGE_SIZE = 50
const VISIBLE_COLUMNS_STORAGE_KEY = 'apparaatti-course-tag-columns'

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
  if (state === 'added' || state === 'ignored') return 'clear'
  return 'add'
}

const readStoredColumns = (): string[] | null => {
  try {
    const stored = window.localStorage.getItem(VISIBLE_COLUMNS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storeColumns = (keys: string[]) => {
  try {
    window.localStorage.setItem(VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(keys))
  } catch {
    return
  }
}

interface CurTagMatrixProps {
  tags: CourseTag[]
}

const CurTagMatrix = ({ tags }: CurTagMatrixProps) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [storedColumns, setStoredColumns] = useState<string[] | null>(readStoredColumns)

  const visibleKeys = storedColumns ?? tags.map(tag => tag.key)
  const visibleTags = tags.filter(tag => visibleKeys.includes(tag.key))

  const handleColumnsChange = (keys: string[]) => {
    setStoredColumns(keys)
    storeColumns(keys)
  }

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

  const { data: tagStates } = useQuery({
    queryKey: ['course-tag-states', curIds.join(',')],
    queryFn: () => fetchCurTagStates(curIds),
    enabled: curIds.length > 0,
  })

  const stateFor = (curId: string, tagKey: string): TagCellState =>
    tagStates?.find(state => state.curId === curId)?.tags.find(entry => entry.key === tagKey)?.source ?? 'unset'

  const handleToggle = async (curId: string, tagKey: string) => {
    await saveCurTag(curId, tagKey, nextMode(stateFor(curId, tagKey)))
    await queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })
  }

  return (
    <Box>
      <CoursesSearchFields onSearch={handleSearch} autoSearch />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }} useFlexGap flexWrap="wrap">
        <TagColumnPicker tags={tags} visibleKeys={visibleKeys} onChange={handleColumnsChange} />
        <BlackOutlinedButton type="button" onClick={() => setIsBulkOpen(true)}>
          {t('v2:courseTags.bulk.open')}
        </BlackOutlinedButton>
        <Typography variant="body2">{t('v2:courseTags.matched', { count: coursesData?.total ?? 0 })}</Typography>
      </Stack>

      <Typography variant="body2" sx={{ mb: 1, color: '#374151' }}>
        {t('v2:courseTags.legend')}
      </Typography>

      {isLoading ? (
        <Typography>{t('v2:admin.loading')}</Typography>
      ) : (
        <TableContainer sx={matrixContainerSx}>
          <Table size="small" stickyHeader sx={{ width: 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={stickyCornerCellSx}>{t('v2:courseTags.course')}</TableCell>
                {visibleTags.map(tag => (
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
              {courses.map(course => (
                <TableRow key={course.id} hover>
                  <TableCell sx={stickyFirstCellSx}>
                    <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                      {getDisplayCourseName(course, i18n.language)}
                    </Typography>
                  </TableCell>
                  {visibleTags.map(tag => (
                    <TableCell key={tag.key} align="center" sx={{ p: 0.25 }}>
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
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={coursesData?.totalPages ?? 1}
          page={page}
          onChange={(_event, value) => setPage(value)}
          sx={{
            '& .MuiPaginationItem-root': { color: '#374151' },
            '& .Mui-selected': { backgroundColor: '#111827 !important', color: '#ffffff' },
          }}
        />
      </Box>

      <BulkApplyDialog
        open={isBulkOpen}
        tags={tags}
        searchValues={searchValues}
        onClose={() => setIsBulkOpen(false)}
        onApplied={() => queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })}
      />
    </Box>
  )
}

export default CurTagMatrix
