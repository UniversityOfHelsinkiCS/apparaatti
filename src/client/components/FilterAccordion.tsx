import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, Box } from '@mui/material'
import HyChip from './common/hy/HyChip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ReactNode, SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useFilterContext, filterConfigMap, getFilterVariant } from '../contexts/filterContext'
import HyTag from './common/hy/HyTag'

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

  const handleDelete = (valueId: string) => {
    if (Array.isArray(cfg.state)) {
      cfg.setState(cfg.state.filter((id: string) => id !== valueId))
    } else {
      cfg.setState('')
    }
  }

  return (
    <Stack onClick={e => e.stopPropagation()} sx={{ ml: 'auto', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
      {activeChips.map(chip => (
        <HyChip key={chip.id} label={chip.label} onClick={() => handleDelete(chip.id)} size="small" />
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
  const { t } = useTranslation()
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
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
          {mandatory && <HyTag text={t('question:mandatory')} colour="attention" ariaHidden={false} />}
          <Typography sx={{ mr: 1 }}>{title}</Typography>
          {filterId && <ActiveFilterChips filterId={filterId} />}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>{children}</AccordionDetails>
    </Accordion>
  )
}

export default FilterAccordion
