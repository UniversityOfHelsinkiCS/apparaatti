import { Box } from '@mui/material'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { filterConfigMap, getFilterVariant, useFilterContext } from '../contexts/filterContext'
import HyAccordion from './common/hy/HyAccordion'
import HyChip from './common/hy/HyChip'
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
    <Box
      component="span"
      sx={{
        ml: 'auto',
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        flexWrap: 'wrap',
        zIndex: 2, // render above the mouseover highlight of accordion header
      }}
    >
      {activeChips.map(chip => (
        <HyChip
          key={chip.id}
          label={chip.label}
          onClick={e => {
            e?.stopPropagation()
            handleDelete(chip.id)
          }}
          size="small"
        />
      ))}
    </Box>
  )
}

interface FilterAccordionProps {
  title: string
  children: ReactNode
  filterId?: string
  mandatory?: boolean
  expanded?: boolean
  onChange?: (isExpanded: boolean) => void
  isFirst?: boolean
}

const FilterAccordion = ({
  title,
  children,
  filterId,
  mandatory,
  expanded,
  onChange,
  isFirst = true,
}: FilterAccordionProps) => {
  const { t } = useTranslation()
  return (
    <HyAccordion
      open={expanded}
      onChange={onChange}
      variant="compact"
      animate
      borders={isFirst ? 'both' : 'bottom'}
      summary={
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
          {mandatory && <HyTag text={t('question:mandatory')} colour="attention" ariaHidden={false} />}
          {title}
          {filterId && <ActiveFilterChips filterId={filterId} />}
        </Box>
      }
    >
      {children}
    </HyAccordion>
  )
}

export default FilterAccordion
