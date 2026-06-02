import { Box, TextField, Typography } from '@mui/material'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'

export interface CoursesSearchFieldsValues {
  nameInput: string
  urnInput: string
  excludeUrnsInput: string
  courseCodeInput: string
  excludeCourseCodesInput: string
}

interface CoursesSearchFieldsProps extends CoursesSearchFieldsValues {
  setNameInput: (v: string) => void
  setUrnInput: (v: string) => void
  setExcludeUrnsInput: (v: string) => void
  setCourseCodeInput: (v: string) => void
  setExcludeCourseCodesInput: (v: string) => void
  onSearch: () => void
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

const CoursesSearchFields = ({
  nameInput,
  urnInput,
  excludeUrnsInput,
  courseCodeInput,
  excludeCourseCodesInput,
  setNameInput,
  setUrnInput,
  setExcludeUrnsInput,
  setCourseCodeInput,
  setExcludeCourseCodesInput,
  onSearch,
}: CoursesSearchFieldsProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>Name</Typography>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
      </Box>

      {/* URN filters (operate on customCodeUrns) */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>URN</Typography>
        <TextField
          label="Include"
          variant="outlined"
          size="small"
          value={urnInput}
          onChange={(e) => setUrnInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Exclude (comma-separated)"
          variant="outlined"
          size="small"
          value={excludeUrnsInput}
          onChange={(e) => setExcludeUrnsInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 240 }}
        />
      </Box>

      {/* Course code filters (operate on linked Cu.courseCode) */}
      <Box component="fieldset" sx={fieldsetSx}>
        <Typography component="legend" sx={legendSx}>Course code</Typography>
        <TextField
          label="Include"
          variant="outlined"
          size="small"
          value={courseCodeInput}
          onChange={(e) => setCourseCodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Exclude (comma-separated)"
          variant="outlined"
          size="small"
          value={excludeCourseCodesInput}
          onChange={(e) => setExcludeCourseCodesInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 240 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlackOutlinedButton size="small" onClick={onSearch}>
          Search
        </BlackOutlinedButton>
      </Box>
    </Box>
  )
}

export default CoursesSearchFields
