import { Box, Typography, Button, Stack } from '@mui/material'
import { filterConfigMap, useFilterContext } from './filterContext'




const ActiveFilterCard = ({ filterId }: {filterId: string}) => {
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const filterData = filterContext.filters.find((f) => f.id === filterId)
  console.log('active filter card')
  console.log(filterData)
  return (
    <Typography variant="body1">
      <strong>{cfg?.shortName} : {cfg.state}</strong>

    </Typography>
  
  )
}


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
          filtersThatAreActive.map((f) => <ActiveFilterCard key={f} filterId={f}/>)
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
