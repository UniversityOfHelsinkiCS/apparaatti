import { Box, Typography, Button, Stack, IconButton, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { filterConfigMap, getFilterVariant, useFilterContext } from './filterContext'
import { getOptionDisplayTexts } from '../hooks/useQuestions'
import { Variant } from '../../common/types'


const FilterValueRenderer = ({cfg, variant}: {cfg: any, variant: Variant | null}) => {
  const isArray = Array.isArray(cfg.state)
  
  if (isArray && cfg.state.length > 0) {
    return (
      <>
        {cfg.state.map((valueId: string) => {
          const option = variant?.options?.find((o) => o.id === valueId)
          const displayText = option?.name || valueId
          
          return (
            <Chip
              key={valueId}
              label={displayText}
              size="small"
              onDelete={() => {
                // Remove this specific value from the array
                const newState = cfg.state.filter((id: string) => id !== valueId)
                cfg.setState(newState)
              }}
              sx={{ margin: '2px' }}
            />
          )
        })}
      </>
    )
  }
  
  const valueTexts = getOptionDisplayTexts(variant, cfg.state)
  return (
    valueTexts.map((s: any) => <Typography key={s}>{s}</Typography>)
  )
  
}


const ActiveFilterCard = ({ filterId }: {filterId: string}) => {
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const hide = cfg?.hideInCurrentFiltersDisplay != undefined ? cfg.hideInCurrentFiltersDisplay : false
  const variant = getFilterVariant(filterContext, filterId)
  const question = filterContext.filters.find((q: any) => q.id === filterId)

  const handleClearFilter = () => {
    if (!cfg) return
    if (Array.isArray(cfg.state)) {
      cfg.setState([])
    } else {
      cfg.setState('')
    }
  }

  if(hide || !cfg){
    return (<></>)
  }
  
  const hasMultipleValues = Array.isArray(cfg.state) && cfg.state.length > 1
  
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body1">
        <strong>{question?.shortName || filterId}: </strong>
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <FilterValueRenderer cfg={cfg} variant={variant}/>
      </Stack>
      {(hasMultipleValues || !Array.isArray(cfg.state)) && (
        <IconButton size="small" onClick={handleClearFilter} title="Clear all">
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  )
}


const CurrentFilterDisplay = () => {
  const filterContext = useFilterContext()
  const filtersConfig = filterConfigMap(filterContext)
  const filtersThatAreActive = Array.from(filtersConfig.keys()).filter((key) => {return filtersConfig.get(key)?.state != ''}) 
   
  const handleClearAllFilters = () => {
    Array.from(filtersConfig.keys()).forEach((filterId) => {
      const cfg = filtersConfig.get(filterId)
      if (cfg && cfg.state !== '' && !(Array.isArray(cfg.state) && cfg.state.length === 0)) {
        if (Array.isArray(cfg.state)) {
          cfg.setState([])
        } else {
          cfg.setState('')
        }
      }
    })
  }

  return (
    <Box
      border="2px solid pink"
      borderRadius={2}
      p={2}
      sx={{ maxWidth: '99%', margin: '2', backgroundColor: '#fff' }}
    >
      <Typography><strong>Suodattimet: </strong></Typography>
      <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {
          filtersThatAreActive.map((f) => <ActiveFilterCard key={f} filterId={f}/>)
        }
        <Button
          variant="text"
          sx={{ alignSelf: 'start', textTransform: 'none', color: 'primary.main' }}
          onClick={handleClearAllFilters}
        >
          Tyhjennä suodattimet
        </Button>
      </Stack>
    </Box>
  )
}

export default CurrentFilterDisplay
