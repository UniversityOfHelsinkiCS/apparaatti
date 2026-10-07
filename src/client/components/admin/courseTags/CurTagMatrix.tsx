import { Box, Stack, Typography } from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, CurTagPremises, LocalizedString, TagBase } from '../../../../common/types.ts'
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
import type { CurMutationsByCur, CurTagModeOrClear, TagDraft } from './tagDraftBuffer.ts'
import { baseKey, cuMutationIndex, curTagStates } from './tagDraftBuffer.ts'
import TagMatrixPagination from './TagMatrixPagination.tsx'

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
  curMutations: CurMutationsByCur
  cuMutations: TagDraft['cu']
  onCurToggle: (curId: string, tagKey: string, mode: CurTagMutationMode) => void
  onBulkApply: (curIds: string[], tagKeys: string[], mode: CurTagMutationMode) => void
}

interface RowCacheEntry {
  premises: CurTagPremises
  curMutations: Record<string, CurTagModeOrClear> | undefined
  cuIndex: ReturnType<typeof cuMutationIndex>
  state: Map<string, TagCellState>
}

const CurTagMatrix = ({ tags, base, curMutations, cuMutations, onCurToggle, onBulkApply }: CurTagMatrixProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [storedColumns, setStoredColumns] = useState<string[] | null>(readStoredColumns)

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
    `course-tags-courses-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/courses?${buildCourseQueryString(searchValues, page, PAGE_SIZE)}`,
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

  const cuIndex = useMemo(() => cuMutationIndex(cuMutations), [cuMutations])

  const rowCache = useRef(new Map<string, RowCacheEntry>())

  const stateByCur = useMemo(() => {
    const index = new Map<string, Map<string, TagCellState>>()
    const nextCache = new Map<string, RowCacheEntry>()

    for (const entry of premises ?? []) {
      const muts = curMutations[entry.curId]
      const cached = rowCache.current.get(entry.curId)
      const isUnchanged = cached?.premises === entry && cached.curMutations === muts && cached.cuIndex === cuIndex
      const state = isUnchanged ? cached.state : curTagStates(entry, muts, cuIndex)

      nextCache.set(entry.curId, { premises: entry, curMutations: muts, cuIndex, state })
      index.set(entry.curId, state)
    }

    rowCache.current = nextCache
    return index
  }, [premises, curMutations, cuIndex])

  const stateRef = useRef(stateByCur)
  stateRef.current = stateByCur

  const handleToggle = useCallback(
    (curId: string, tagKey: string) => {
      const current = stateRef.current.get(curId)?.get(tagKey) ?? 'unset'
      onCurToggle(curId, tagKey, nextMode(current))
    },
    [onCurToggle]
  )

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
        <CurTagTable courses={courses} tags={visibleTags} stateByCur={stateByCur} onToggle={handleToggle} />
      )}

      <TagMatrixPagination count={coursesData?.totalPages ?? 1} page={page} onChange={setPage} />

      <BulkApplyDialog
        open={isBulkOpen}
        tags={tags}
        searchValues={searchValues}
        onClose={() => setIsBulkOpen(false)}
        onApply={onBulkApply}
      />
    </Box>
  )
}

export default CurTagMatrix
