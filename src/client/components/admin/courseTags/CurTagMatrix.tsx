import { Box, Stack, Typography } from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, LocalizedString, TagBase } from '../../../../common/types.ts'
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
import { fetchCurTagPremises } from './courseTagUtils.ts'
import CurTagTable from './CurTagTable.tsx'
import type { TagCellState } from './TagCell.tsx'
import TagColumnPicker from './TagColumnPicker.tsx'
import TagMatrixPagination from './TagMatrixPagination.tsx'
import { baseKey, curTagStates } from './tagVersionState.ts'
import { useTagMutation } from './useTagMutation.ts'

const PAGE_SIZE = 15
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
  base: TagBase
  isEditable: boolean
}

const CurTagMatrix = ({ tags, base, isEditable }: CurTagMatrixProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [storedColumns, setStoredColumns] = useState<string[] | null>(readStoredColumns)
  const mutate = useTagMutation(base)

  const visibleKeys = useMemo(() => storedColumns ?? tags.map(tag => tag.key), [storedColumns, tags])

  const visibleTags = useMemo(() => {
    const keySet = new Set(visibleKeys)
    return tags.filter(tag => keySet.has(tag.key))
  }, [tags, visibleKeys])

  const handleColumnsChange = (keys: string[]) => {
    setStoredColumns(keys)
    storeColumns(keys)
  }

  const handleSearch = (fields: CoursesSearchFieldsValues) => {
    setSearchValues(courseSearchValuesFromFields(fields))
    setPage(1)
  }

  const { data: coursesData, isLoading } = useApi<PaginatedCoursesResponse>(
    `course-tags-courses-${baseKey(base)}-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/course-tags/courses?${buildCourseQueryString(searchValues, page, PAGE_SIZE)}&base=${baseKey(base)}`,
    'GET',
    undefined
  )

  const courses = useMemo(() => coursesData?.courses ?? [], [coursesData])
  const curIds = useMemo(() => courses.map(course => course.id), [courses])

  const { data: premises } = useQuery({
    queryKey: ['course-tag-states', baseKey(base), curIds.join(',')],
    queryFn: () => fetchCurTagPremises(curIds, base),
    enabled: curIds.length > 0,
    placeholderData: keepPreviousData,
  })

  const stateByCur = useMemo(
    () => new Map((premises ?? []).map(entry => [entry.curId, curTagStates(entry)])),
    [premises]
  )

  const stateRef = useRef(stateByCur)
  stateRef.current = stateByCur

  const handleToggle = useCallback(
    (curId: string, tagKey: string) => {
      const current = stateRef.current.get(curId)?.get(tagKey) ?? 'unset'
      mutate.mutate({ tags: [], cu: [], cur: [{ curId, tagKey, mode: nextMode(current) }] })
    },
    [mutate]
  )

  const handleBulkApply = useCallback(
    (curIds: string[], tagKeys: string[], mode: CurTagMutationMode) => {
      const cur = curIds.flatMap(curId => tagKeys.map(tagKey => ({ curId, tagKey, mode })))
      mutate.mutate({ tags: [], cu: [], cur })
    },
    [mutate]
  )

  return (
    <Box>
      <CoursesSearchFields onSearch={handleSearch} autoSearch filterBy="tags" tagKeys={tags.map(tag => tag.key)} />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }} useFlexGap flexWrap="wrap">
        <TagColumnPicker tags={tags} visibleKeys={visibleKeys} onChange={handleColumnsChange} />
        <BlackOutlinedButton type="button" onClick={() => setIsBulkOpen(true)} disabled={!isEditable}>
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
        <CurTagTable
          courses={courses}
          tags={visibleTags}
          stateByCur={stateByCur}
          isEditable={isEditable}
          onToggle={handleToggle}
        />
      )}

      <TagMatrixPagination count={coursesData?.totalPages ?? 1} page={page} onChange={setPage} />

      <BulkApplyDialog
        open={isBulkOpen}
        tags={tags}
        base={base}
        searchValues={searchValues}
        onClose={() => setIsBulkOpen(false)}
        onApply={handleBulkApply}
      />
    </Box>
  )
}

export default CurTagMatrix
