import { Box, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { UrnMatchMode } from '../../../common/types.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import TagFilterFieldset from './TagFilterFieldset.tsx'
import UrnFilterFieldset from './UrnFilterFieldset.tsx'

export type ReviewStatusFilterValue = 'all' | 'reviewed' | 'not-reviewed'

export interface CoursesSearchFieldsValues {
  nameInput: string
  urnInputs: string[]
  urnMode: UrnMatchMode
  excludeUrnsInputs: string[]
  excludeUrnsMode: UrnMatchMode
  tagInputs: string[]
  tagMode: UrnMatchMode
  excludeTagsInputs: string[]
  excludeTagsMode: UrnMatchMode
  courseCodeInput: string
  excludeCourseCodesInput: string
  reviewStatusInput: ReviewStatusFilterValue
  dateFromInput: string
  dateToInput: string
}

interface CoursesSearchFieldsProps {
  onSearch: (values: CoursesSearchFieldsValues) => void
  autoSearch?: boolean
  filterBy?: 'urns' | 'tags'
  tagKeys?: string[]
}

const AUTO_SEARCH_DEBOUNCE_MS = 300

const fieldsetSx = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.23)',
  borderRadius: 1,
  px: 1.5,
  py: 1,
  m: 0,
} as const
const legendSx = { px: 0.5, fontWeight: 600, fontSize: 12 } as const

const CoursesSearchFields = ({
  onSearch,
  autoSearch = false,
  filterBy = 'urns',
  tagKeys,
}: CoursesSearchFieldsProps) => {
  const { t } = useTranslation()
  const [nameInput, setNameInput] = useState('')
  const [urnInputs, setUrnInputs] = useState<string[]>([])
  const [urnMode, setUrnMode] = useState<UrnMatchMode>('or')
  const [excludeUrnsInputs, setExcludeUrnsInputs] = useState<string[]>([])
  const [excludeUrnsMode, setExcludeUrnsMode] = useState<UrnMatchMode>('or')
  const [tagInputs, setTagInputs] = useState<string[]>([])
  const [tagMode, setTagMode] = useState<UrnMatchMode>('or')
  const [excludeTagsInputs, setExcludeTagsInputs] = useState<string[]>([])
  const [excludeTagsMode, setExcludeTagsMode] = useState<UrnMatchMode>('or')
  const [courseCodeInput, setCourseCodeInput] = useState('')
  const [excludeCourseCodesInput, setExcludeCourseCodesInput] = useState('')
  const [reviewStatusInput, setReviewStatusInput] = useState<ReviewStatusFilterValue>('all')
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')

  const values: CoursesSearchFieldsValues = {
    nameInput,
    urnInputs,
    urnMode,
    excludeUrnsInputs,
    excludeUrnsMode,
    tagInputs,
    tagMode,
    excludeTagsInputs,
    excludeTagsMode,
    courseCodeInput,
    excludeCourseCodesInput,
    reviewStatusInput,
    dateFromInput,
    dateToInput,
  }

  const handleSearch = () => {
    onSearch(values)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  const valuesRef = useRef(values)
  valuesRef.current = values

  useEffect(() => {
    if (!autoSearch) return

    const timer = setTimeout(() => onSearchRef.current(valuesRef.current), AUTO_SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [
    autoSearch,
    nameInput,
    urnInputs,
    urnMode,
    excludeUrnsInputs,
    excludeUrnsMode,
    tagInputs,
    tagMode,
    excludeTagsInputs,
    excludeTagsMode,
    courseCodeInput,
    excludeCourseCodesInput,
    reviewStatusInput,
    dateFromInput,
    dateToInput,
  ])

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          {t('v2:admin.courses.search.nameLegend')}
        </Typography>
        <TextField
          label={t('v2:admin.courses.search.nameField')}
          variant="outlined"
          size="small"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
      </Box>

      {filterBy === 'tags' ? (
        <TagFilterFieldset
          tagKeys={tagKeys ?? []}
          includeValues={tagInputs}
          includeMode={tagMode}
          excludeValues={excludeTagsInputs}
          excludeMode={excludeTagsMode}
          onIncludeChange={setTagInputs}
          onIncludeModeChange={setTagMode}
          onExcludeChange={setExcludeTagsInputs}
          onExcludeModeChange={setExcludeTagsMode}
        />
      ) : (
        <UrnFilterFieldset
          includeValues={urnInputs}
          includeMode={urnMode}
          excludeValues={excludeUrnsInputs}
          excludeMode={excludeUrnsMode}
          onIncludeChange={setUrnInputs}
          onIncludeModeChange={setUrnMode}
          onExcludeChange={setExcludeUrnsInputs}
          onExcludeModeChange={setExcludeUrnsMode}
        />
      )}

      {/* Course code filters (operate on linked Cu.courseCode) */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          {t('v2:admin.courses.search.courseCodeLegend')}
        </Typography>
        <TextField
          label={t('v2:admin.courses.search.courseCodeInclude')}
          variant="outlined"
          size="small"
          value={courseCodeInput}
          onChange={e => setCourseCodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label={t('v2:admin.courses.search.courseCodeExclude')}
          variant="outlined"
          size="small"
          value={excludeCourseCodesInput}
          onChange={e => setExcludeCourseCodesInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 240 }}
        />
      </Box>

      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          {t('v2:admin.courses.search.reviewLegend')}
        </Typography>
        <TextField
          select
          label={t('v2:admin.courses.search.statusField')}
          variant="outlined"
          size="small"
          value={reviewStatusInput}
          onChange={e => setReviewStatusInput(e.target.value as ReviewStatusFilterValue)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">{t('v2:admin.courses.search.statusAll')}</MenuItem>
          <MenuItem value="reviewed">{t('v2:admin.courses.search.statusReviewed')}</MenuItem>
          <MenuItem value="not-reviewed">{t('v2:admin.courses.search.statusNotReviewed')}</MenuItem>
        </TextField>
      </Box>

      {/* Course date is a containment filter: the course must start on or after
          "From" and end on or before "To", not merely overlap the range. */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Tooltip title={t('v2:admin.courses.search.courseDateTooltip')}>
          <Typography component="legend" sx={legendSx}>
            {t('v2:admin.courses.search.courseDateLegend')}
          </Typography>
        </Tooltip>
        <TextField
          label={t('v2:admin.courses.search.from')}
          type="date"
          variant="outlined"
          size="small"
          value={dateFromInput}
          onChange={e => setDateFromInput(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label={t('v2:admin.courses.search.to')}
          type="date"
          variant="outlined"
          size="small"
          value={dateToInput}
          onChange={e => setDateToInput(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlackOutlinedButton size="small" onClick={handleSearch}>
          {t('v2:admin.courses.search.submit')}
        </BlackOutlinedButton>
      </Box>
    </Box>
  )
}

export default CoursesSearchFields
