import { Box, MenuItem, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import type { UniqueUrnResponse } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import AutoCompleteTextField from '../common/AutoCompleteTextField.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import { hy } from '../common/hy/hyTokens.ts'

export type ReviewStatusFilterValue = 'all' | 'reviewed' | 'not-reviewed'

export interface CoursesSearchFieldsValues {
  nameInput: string
  urnInput: string
  excludeUrnsInput: string
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

const CoursesSearchFields = ({ onSearch }: CoursesSearchFieldsProps) => {
  const [nameInput, setNameInput] = useState('')
  const [urnInput, setUrnInput] = useState('')
  const [courseCodeInput, setCourseCodeInput] = useState('')
  const [excludeUrnsInput, setExcludeUrnsInput] = useState('')
  const [excludeCourseCodesInput, setExcludeCourseCodesInput] = useState('')
  const [reviewStatusInput, setReviewStatusInput] = useState<ReviewStatusFilterValue>('all')
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')

  const handleSearch = () => {
    onSearch({
      nameInput,
      urnInput,
      courseCodeInput,
      excludeUrnsInput,
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
          Name
        </Typography>
        <TextField
          label="Search"
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
          URN
        </Typography>
        <AutoCompleteTextField
          id="course-urn-include"
          value={urnInput}
          onChange={setUrnInput}
          options={urnOptions?.codeUrns ?? []}
          label="Include"
          sx={{
            minWidth: 300,
            ...(urnInput && { '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.success } }),
          }}
        />
        <AutoCompleteTextField
          id="course-urn-exclude"
          value={excludeUrnsInput}
          onChange={setExcludeUrnsInput}
          options={urnOptions?.codeUrns ?? []}
          label="Exclude"
          sx={{
            minWidth: 300,
            ...(excludeUrnsInput && { '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.danger } }),
          }}
        />
      </Box>

      {/* Course code filters (operate on linked Cu.courseCode) */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          Course code
        </Typography>
        <TextField
          label="Include"
          variant="outlined"
          size="small"
          value={courseCodeInput}
          onChange={e => setCourseCodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Exclude (comma-separated)"
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
          Review
        </Typography>
        <TextField
          select
          label="Status"
          variant="outlined"
          size="small"
          value={reviewStatusInput}
          onChange={e => setReviewStatusInput(e.target.value as ReviewStatusFilterValue)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="reviewed">Reviewed</MenuItem>
          <MenuItem value="not-reviewed">Not reviewed</MenuItem>
        </TextField>
      </Box>

      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>
          Course date
        </Typography>
        <TextField
          label="From"
          type="date"
          variant="outlined"
          size="small"
          value={dateFromInput}
          onChange={e => setDateFromInput(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label="To"
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
          Search
        </BlackOutlinedButton>
      </Box>
    </Box>
  )
}

export default CoursesSearchFields
