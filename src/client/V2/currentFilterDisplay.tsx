import { Box, Typography, Button, Stack } from '@mui/material'
import { filterConfigMap, useFilterContext } from './filterContext'


const FilterValueRenderer = ({cfg}: {cfg: any}) => {

  const isArray = Array.isArray(cfg.state)
  if(!isArray)
  {
    return(
      <Typography>{cfg.state}</Typography>
    )
  }
  else{
    return (
      cfg.state.map((s: any) => <Typography key={s}>{s}</Typography>)
    )
  }
}


const ActiveFilterCard = ({ filterId }: {filterId: string}) => {
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const filterData = filterContext.filters.find((f) => f.id === filterId)
  console.log('active filter card')
  console.log(filterData)
  return (
    <Stack direction="row">
      <Typography variant="body1">
        <strong>{cfg?.shortName}: </strong>
      </Typography>
      <Stack direction="row" spacing={2}>
        <FilterValueRenderer cfg={cfg}/>
      </Stack>
    </Stack>
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
