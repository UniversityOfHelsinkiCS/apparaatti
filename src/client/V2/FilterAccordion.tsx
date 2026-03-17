import { Accordion, AccordionSummary, AccordionDetails, Typography, Chip, Stack, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ReactNode } from 'react'
import { useFilterContext, filterConfigMap, getFilterVariant } from './filterContext'

interface ActiveFilterChipsProps {
  filterId: string
}

const ActiveFilterChips = ({ filterId }: ActiveFilterChipsProps) => {
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const variant = getFilterVariant(filterContext, filterId)

  if (!cfg) return null

  const activeChips: { id: string; label: string }[] = []
  if (Array.isArray(cfg.state)) {
    cfg.state.forEach((valueId: string) => {
      const option = variant?.options?.find((o: any) => o.id === valueId)
      activeChips.push({ id: valueId, label: option?.name || valueId })
    })
  } else if (cfg.state !== '') {
    const option = variant?.options?.find((o: any) => o.id === cfg.state)
    activeChips.push({ id: cfg.state, label: option?.name || cfg.state })
  }

  if (activeChips.length === 0) return null

  const handleDelete = (e: React.MouseEvent, valueId: string) => {
    e.stopPropagation()
    if (Array.isArray(cfg.state)) {
      cfg.setState(cfg.state.filter((id: string) => id !== valueId))
    } else {
      cfg.setState('')
    }
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" onClick={(e) => e.stopPropagation()} sx={{ ml: 'auto' }}>
      {activeChips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          size="small"
          onDelete={(e) => handleDelete(e, chip.id)}
          sx={{ pointerEvents: 'all' }}
        />
      ))}
    </Stack>
  )
}

interface FilterAccordionProps {
  title: string
  children: ReactNode
  filterId?: string
}

const FilterAccordion = ({ title, children, filterId }: FilterAccordionProps) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 0.5 }}>
          <Typography sx={{ mr: 1 }}>{title}</Typography>
          {filterId && <ActiveFilterChips filterId={filterId} />}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

export default FilterAccordion
