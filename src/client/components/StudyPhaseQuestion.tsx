import { useEffect, useState } from 'react'
import { Box, MenuItem, Select, Typography } from '@mui/material'

const StudyPhaseQuestion = ({ studyData }: { studyData: any }) => {
  const [selectedPhase, setSelectedPhase] = useState('')
  const [selectedField, setSelectedField] = useState('')

  const handleFieldChange = (event: any) => {
    setSelectedField(event.target.value)
  }

  const getFirstSelection = () => {
    if (studyData?.phase1Data?.length) {
      return 'phase1'
    } else if (studyData?.phase2Data?.length) {
      return 'phase2'
    }
    return ''
  }

  const currentData = studyData?.phase1Data.concat(studyData?.phase2Data)

  useEffect(() => {
    const initialPhase = getFirstSelection()
    if (initialPhase) {
      setSelectedPhase(initialPhase)
    }
    if (studyData.phase1Data != null) {
      setSelectedField(studyData.phase1Data[0].id)
    } else if (studyData.phase2Data) {
      setSelectedField(studyData.phase2Data[0].id)
    }
  }, [studyData])

  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      {selectedPhase && (
        <>
          <Typography id="study-field-select-label">
            Valitse opinto-oikeus
          </Typography>
          {currentData.length > 1 && (
            <Select
              sx={{
                padding: '1px',
                minWidth: 100,
                border: '1px solid lightgray',
              }}
              name="study-field-select"
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
          )}
          {currentData.length < 2 && (
            <p
              style={{
                border: '2px solid lightgrey',
                padding: '10px',
                borderRadius: '5px',
                minWidth: '100px',
              }}
            >
              {currentData[0].name.fi}
            </p>
          )}
        </>
      )}
    </Box>
  )
}
export default StudyPhaseQuestion
