import { useEffect, useState } from 'react'
import { Box, MenuItem, Select, Typography } from '@mui/material'

const StudyPhaseQuestion = ({ studyData }: { studyData: any }) => {
  const handleFieldChange = (event: any) => {
    setSelectedField(event.target.value)
  }

  const organisations = studyData?.organisations
  if(!organisations){
    return (<p>no organisation found</p>)
  }
  const selectedField = organisations[0]
  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      
      <>
        <Typography id="study-field-select-label">
            Valitse opinto-oikeus
        </Typography>
        {organisations.length > 1 && (
          <Select
            sx={{
              padding: '1px',
              minWidth: 100,
              border: '1px solid lightgray',
            }}
            name="study-field-select"
            labelId="study-field-select-label"
            value={selectedField.code}
            onChange={handleFieldChange}
          >
            {organisations?.map((item: any) => (
              <MenuItem key={item.id} value={item.code}>
                {item.name.fi}
              </MenuItem>
            ))}
          </Select>
        )}
        {organisations.length < 2 && (
          <p
            style={{
              border: '2px solid lightgrey',
              padding: '10px',
              borderRadius: '5px',
              minWidth: '100px',
            }}
          >
            {organisations[0].name.fi}
          </p>
        )}
      </>
      
    </Box>
  )
}
export default StudyPhaseQuestion
