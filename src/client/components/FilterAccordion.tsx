import { Box, Chip, Stack, Typography } from '@mui/material'
import { ReactNode, useEffect, useRef } from 'react'
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

interface DsAccordionElement extends HTMLElement {
  setIsExpanded(v: boolean): Promise<void>
}

interface FilterAccordionProps {
  title: string
  children: ReactNode
  filterId?: string
  mandatory?: boolean
  expanded?: boolean
  onChange?: (event: unknown, isExpanded: boolean) => void
}

const FilterAccordion = ({ title, children, filterId, mandatory, expanded, onChange }: FilterAccordionProps) => {
  const accordionRef = useRef<DsAccordionElement>(null)

  useEffect(() => {
    accordionRef.current?.setIsExpanded(expanded ?? false)
  }, [expanded])

  const handleToggle = (e: Event) => {
    const isExpanded = (e as CustomEvent<boolean>).detail
    onChange?.(e, isExpanded)
  }

  return (
    <ds-accordion
      ref={accordionRef}
      ds-variant="compact"
      ds-heading-level={3}
      ondsToggle={handleToggle}
      style={{ marginBottom: '4px' }}
    >
      <div slot="header">
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 0.5 }}>
          {mandatory && <MandatoryBadge />}
          <Typography sx={{ mr: 1 }}>{title}</Typography>
          {filterId && <ActiveFilterChips filterId={filterId} />}
        </Box>
      </div>
      <div slot="content">{children}</div>
    </ds-accordion>
  )
}

export default FilterAccordion
