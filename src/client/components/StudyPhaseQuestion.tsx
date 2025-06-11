import React, { useState } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'

const StudyPhaseQuestion = ({ studyData }: { studyData: any }) => {
  const [selectedPhase, setSelectedPhase] = useState('')
  const [selectedField, setSelectedField] = useState('')

  const handlePhaseChange = (event: any) => {
    setSelectedPhase(event.target.value)
    setSelectedField('')
  }
  
  const handleFieldChange = (event: any ) => {
    setSelectedField(event.target.value)
  }

  const currentData = selectedPhase === 'phase1' ? studyData?.phase1Data : studyData?.phase2Data

  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Typography id="study-phase-select-label">Select Phase</Typography>
        <Select
          labelId="study-phase-select-label"
          value={selectedPhase}
          onChange={handlePhaseChange}
        >
          <MenuItem value="phase1">1. vaiheen opinnot</MenuItem>
          <MenuItem value="phase2">2. vaiheen opinnot</MenuItem>
        </Select>
      </FormControl>

      {selectedPhase && (
        <FormControl fullWidth>
          <Typography id="study-field-select-label">Valitse suunta</Typography>
          <Select
            labelId="study-field-select-label"
            value={selectedField}
            onChange={handleFieldChange}
          >
            {currentData?.map((item: any) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name.fi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

export default StudyPhaseQuestion
