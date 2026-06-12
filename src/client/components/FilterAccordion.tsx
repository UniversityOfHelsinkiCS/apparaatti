import { Accordion, AccordionSummary, AccordionDetails, Typography, Chip, Stack, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ReactNode, SyntheticEvent } from 'react'
import { useFilterContext, filterConfigMap, getFilterVariant } from '../contexts/filterContext'
import MandatoryBadge from './common/MandatoryBadge'

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
    <Stack onClick={e => e.stopPropagation()} sx={{ ml: 'auto', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
      {activeChips.map(chip => (
        <Chip
          key={chip.id}
          label={chip.label}
          size="small"
          onDelete={e => handleDelete(e, chip.id)}
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
  mandatory?: boolean
  expanded?: boolean
  onChange?: (event: SyntheticEvent, isExpanded: boolean) => void
}

const FilterAccordion = ({ title, children, filterId, mandatory, expanded, onChange }: FilterAccordionProps) => {
  return (
    <Accordion expanded={expanded} onChange={onChange} sx={{ mb: 1, '&:before': { display: 'none' } }} disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 1.5,
          minHeight: 52,
          '& .MuiAccordionSummary-content': {
            my: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 0.5 }}>
          {mandatory && <MandatoryBadge />}
          <Typography sx={{ mr: 1 }}>{title}</Typography>
          {filterId && <ActiveFilterChips filterId={filterId} />}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>{children}</AccordionDetails>
    </Accordion>
  )
}

export default FilterAccordion
