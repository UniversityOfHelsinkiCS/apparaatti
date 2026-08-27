import { Box, Divider, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { UniqueUrnResponse, UrnMatchMode } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import { hy } from '../common/hy/hyTokens.ts'
import MultiAutoCompleteTextField from '../common/MultiAutoCompleteTextField.tsx'

export type ReviewStatusFilterValue = 'all' | 'reviewed' | 'not-reviewed'

export interface CoursesSearchFieldsValues {
  nameInput: string
  urnInputs: string[]
  urnMode: UrnMatchMode
  excludeUrnsInputs: string[]
  excludeUrnsMode: UrnMatchMode
  courseCodeInput: string
  excludeCourseCodesInput: string
  reviewStatusInput: ReviewStatusFilterValue
  dateFromInput: string
  dateToInput: string
}

interface CoursesSearchFieldsProps {
  onSearch: (values: CoursesSearchFieldsValues) => void
}

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

// A single URN filter (the value field plus its own mode toggle) is grouped in
// its own bordered box so it is obvious which field the OR/AND toggle controls.
const urnGroupSx = {
  display: 'flex',
  gap: 0.5,
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.23)',
  borderRadius: 1,
  px: 1,
  py: 1,
  m: 0,
} as const
const urnGroupLegendSx = { px: 0.5, fontWeight: 600, fontSize: 11 } as const

interface UrnModeToggleProps {
  id: string
  value: UrnMatchMode
  onChange: (mode: UrnMatchMode) => void
  orTitle: string
  andTitle: string
}

const UrnModeToggle = ({ id, value, onChange, orTitle, andTitle }: UrnModeToggleProps) => (
  <ToggleButtonGroup
    id={id}
    exclusive
    size="small"
    value={value}
    onChange={(_event, newMode: UrnMatchMode | null) => {
      if (newMode) onChange(newMode)
    }}
  >
    <Tooltip title={orTitle}>
      <ToggleButton value="or">OR</ToggleButton>
    </Tooltip>
    <Tooltip title={andTitle}>
      <ToggleButton value="and">AND</ToggleButton>
    </Tooltip>
  </ToggleButtonGroup>
)

const CoursesSearchFields = ({ onSearch }: CoursesSearchFieldsProps) => {
  const { t } = useTranslation()
  const [nameInput, setNameInput] = useState('')
  const [urnInputs, setUrnInputs] = useState<string[]>([])
  const [urnMode, setUrnMode] = useState<UrnMatchMode>('or')
  const [courseCodeInput, setCourseCodeInput] = useState('')
  const [excludeUrnsInputs, setExcludeUrnsInputs] = useState<string[]>([])
  const [excludeUrnsMode, setExcludeUrnsMode] = useState<UrnMatchMode>('or')
  const [excludeCourseCodesInput, setExcludeCourseCodesInput] = useState('')
  const [reviewStatusInput, setReviewStatusInput] = useState<ReviewStatusFilterValue>('all')
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')

  const handleSearch = () => {
    onSearch({
      nameInput,
      urnInputs,
      urnMode,
      courseCodeInput,
      excludeUrnsInputs,
      excludeUrnsMode,
      excludeCourseCodesInput,
      reviewStatusInput,
      dateFromInput,
      dateToInput,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const { data: urnOptions } = useApi<UniqueUrnResponse>('urns', '/api/admin/courses/urns', 'GET')
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

      {/* URN filters (operate on customCodeUrns) */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          {t('v2:admin.courses.search.urnLegend')}
        </Typography>
        <Box component="fieldset" sx={urnGroupSx}>
          <Typography component="legend" sx={urnGroupLegendSx}>
            {t('v2:admin.courses.search.includeLegend')}
          </Typography>
          <MultiAutoCompleteTextField
            id="course-urn-include"
            value={urnInputs}
            onChange={setUrnInputs}
            options={urnOptions?.codeUrns ?? []}
            label={t('v2:admin.courses.search.urnsToInclude')}
            sx={{
              minWidth: 300,
              ...(urnInputs.length > 0 && { '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.success } }),
            }}
          />
          <UrnModeToggle
            id="course-urn-include-mode"
            value={urnMode}
            onChange={setUrnMode}
            orTitle={t('v2:admin.courses.search.includeOrTitle')}
            andTitle={t('v2:admin.courses.search.includeAndTitle')}
          />
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box component="fieldset" sx={urnGroupSx}>
          <Typography component="legend" sx={urnGroupLegendSx}>
            {t('v2:admin.courses.search.excludeLegend')}
          </Typography>
          <MultiAutoCompleteTextField
            id="course-urn-exclude"
            value={excludeUrnsInputs}
            onChange={setExcludeUrnsInputs}
            options={urnOptions?.codeUrns ?? []}
            label={t('v2:admin.courses.search.urnsToExclude')}
            sx={{
              minWidth: 300,
              ...(excludeUrnsInputs.length > 0 && {
                '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.danger },
              }),
            }}
          />
          <UrnModeToggle
            id="course-urn-exclude-mode"
            value={excludeUrnsMode}
            onChange={setExcludeUrnsMode}
            orTitle={t('v2:admin.courses.search.excludeOrTitle')}
            andTitle={t('v2:admin.courses.search.excludeAndTitle')}
          />
        </Box>
      </Box>

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
