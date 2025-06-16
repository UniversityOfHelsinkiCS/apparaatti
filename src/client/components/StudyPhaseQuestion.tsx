import React, { useEffect, useState } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'

const StudyPhaseQuestion = ({ studyData }: { studyData: any }) => {
  const [selectedPhase, setSelectedPhase] = useState('')
  const [selectedField, setSelectedField] = useState('')

  //const handlePhaseChange = (event: any) => {
  //  setSelectedPhase(event.target.value)
  //  setSelectedField('')
  //}
  
  const handleFieldChange = (event: any ) => {
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

  //const getFirstFieldSelection = (initialPhase) => {
  //  if (initialPhase === 'phase1' && studyData?.phase1Data?.length) {
  //    return studyData.phase1Data[0].id
  //  } else if (initialPhase === 'phase2' && studyData?.phase2Data?.length) {
  //    return studyData.phase2Data[0].id
  //  }
  //  return ''
  //}



  //const currentData = selectedPhase === 'phase1' ? studyData?.phase1Data : studyData?.phase2Data
  const currentData = studyData?.phase1Data.concat(studyData?.phase2Data)
  console.log(currentData.length)

    useEffect(() => {
    const initialPhase = getFirstSelection()
    //const initialField = getFirstFieldSelection(initialPhase)
    if (initialPhase) {
      setSelectedPhase(initialPhase)

      //setSelectedField(initialField)
    }

        
   
     console.log("1 ehto")
      if (studyData.phase1Data != null) {
        console.log("phase1")
        setSelectedField(studyData.phase1Data[0].id)
      } else if (studyData.phase2Data) {
        console.log("phase2")
        setSelectedField(studyData.phase2Data[0].id)
      }
    
  }, [studyData])


  //console.log(currentData)
  //console.log(currentData.length)

  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      
  
    
      {selectedPhase && (
        <>
          <Typography id="study-field-select-label">Valitse opintojen suunta</Typography>

          <Select
            sx={{ padding: '1px', minWidth: 100, border: '1px solid lightgray' }}
            name='study-field-select'
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
          
        </>
      )}
    </Box>
  )
}

export default StudyPhaseQuestion


//<Typography id="study-phase-select-label">Valitse opintojen vaihe:</Typography>
//<Select
//  sx={{ padding: '1px', minWidth: 100, border: '1px solid lightgray' }}
//  labelId="study-phase-select-label"
//  name='study-phase-select'
//  value={selectedPhase}
//  onChange={handlePhaseChange}
//>
//  <MenuItem value="phase1">1. vaiheen opinnot</MenuItem>
//  <MenuItem value="phase2">2. vaiheen opinnot</MenuItem>
//</Select>