import { Box, Typography, Button, Stack } from '@mui/material'
import { filterConfigMap, useFilterContext } from './filterContext'







const CurrentFilterDisplay = () => {
  const filterContext = useFilterContext()
  const filtersConfig = filterConfigMap(filterContext)
  const filtersThatAreActive = Array.from(filtersConfig.keys()).filter((key) => {return filtersConfig.get(key)?.state != ''}) 
  
  
  console.log('active filters')
  console.log(filtersThatAreActive)

  return (
    <Box
      border="2px solid pink"
      borderRadius={2}
      p={2}
      sx={{ maxWidth: '99%', margin: '2', backgroundColor: '#fff' }}
    >
      <Typography><strong>Suodattimet: </strong></Typography>
      <Stack direction="row" spacing={3}>
        {
          filtersThatAreActive.map((f) => {return (
            <Typography key={f} variant="body1">
              <strong>{f}</strong>
            </Typography>
          )})
        }
        <Button
          variant="text"
          sx={{ alignSelf: 'start', textTransform: 'none', color: 'primary.main' }}
        >
          Tyhjennä suodattimet
        </Button>
      </Stack>
    </Box>
  )
}

export default CurrentFilterDisplay
