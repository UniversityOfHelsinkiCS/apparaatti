import { Box, MenuItem, Select, Typography } from '@mui/material'

const StudyPhaseQuestion = ({ studyData }: { studyData: any }) => {
  const organisations = studyData?.organisations
  if(!organisations){
    return (<p>no organisation found</p>)
  }
  const selectedField = organisations[0]
  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      
      <>
        <Typography id="study-field-select-label">
            Valitse tiedekunta
        </Typography>
       
        <Select
          sx={{
            padding: '1px',
            minWidth: 100,
            border: '1px solid lightgray',
           
          }}
          disabled={organisations.lenght < 2 ? true : false} //makes drop down disabled if there is only one option to choose
          name="study-field-select"
          labelId="study-field-select-label"
          value={selectedField.code}
        >
          {organisations?.map((item: any) => (
            <MenuItem key={item.id} value={item.code}>
              {item.name.fi}
            </MenuItem>
          ))}
        </Select>
     
      </>
      
    </Box>
  )
}
export default StudyPhaseQuestion
