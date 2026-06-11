import { Box, Typography, Button, Stack } from '@mui/material'
import { filterConfigMap, getFilterVariant, isFilterStateAnswered, useFilterContext } from '../contexts/filterContext'
import FilterSummaryItem from './common/FilterSummaryItem'

const ActiveFilterCard = ({ filterId }: { filterId: string }) => {
  const filterContext = useFilterContext()
  const config = filterConfigMap(filterContext).get(filterId)
  const hide = filterContext.filters.find((q: any) => q.id === filterId)?.hideInCurrentFiltersDisplay ?? false
  const variant = getFilterVariant(filterContext, filterId)
  const question = filterContext.filters.find((q: any) => q.id === filterId)
  const configState = config?.state ?? ''

  const handleClearFilter = () => {
    if (!config) return
    if (Array.isArray(configState)) {
      config.setState([])
    } else {
      config.setState('')
    }
  }

  if (hide || !config || !isFilterStateAnswered(config.state)) {
    return <></>
  }

  return (
    <FilterSummaryItem
      label={question?.shortName || filterId}
      state={configState}
      variant={variant}
      onDeleteValue={
        Array.isArray(configState)
          ? valueId => {
              config.setState(configState.filter(id => id !== valueId))
            }
          : undefined
      }
      onClear={handleClearFilter}
    />
  )
}

const CurrentFilterDisplay = () => {
  const filterContext = useFilterContext()
  const filtersConfig = filterConfigMap(filterContext)
  const filtersThatAreActive = Array.from(filtersConfig.keys()).filter(key => {
    const state = filtersConfig.get(key)?.state
    return isFilterStateAnswered(state)
  })

  const handleClearAllFilters = () => {
    Array.from(filtersConfig.keys()).forEach(filterId => {
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
    <Box border="2px solid pink" borderRadius={2} p={2} sx={{ maxWidth: '99%', margin: '2', backgroundColor: '#fff' }}>
      <Typography>
        <strong>Suodattimet: </strong>
      </Typography>
      <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {filtersThatAreActive.map(f => (
          <ActiveFilterCard key={f} filterId={f} />
        ))}
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
