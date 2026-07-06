import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { filterConfigMap, getFilterVariant, useFilterContext } from '../contexts/filterContext'
import HyChip from './common/hy/HyChip'

const MAX_CHARS = 21

const buildChipLabel = (labels: string[], maxChars: number = MAX_CHARS): string => {
  if (labels.length === 0) return ''

  const full = labels.join(', ')
  if (full.length <= maxChars) return full

  // Fit as many labels as possible left-to-right; append "... + N" for hidden ones.
  // If the first label alone exceeds the limit, truncate it to make it fit.
  let visibleText = ''
  let visibleCount = 0

  for (let i = 0; i < labels.length; i++) {
    const candidate = i === 0 ? labels[i] : `${visibleText}, ${labels[i]}`
    const hiddenAfterThis = labels.length - i - 1
    const suffix = hiddenAfterThis > 0 ? `... + ${hiddenAfterThis}` : ''
    const fits = (candidate + suffix).length <= maxChars

    if (fits) {
      visibleText = candidate
      visibleCount = i + 1
      continue
    }

    if (i === 0) {
      if (suffix.length > 0) {
        // Suffix provides the "...", so just slice the label to the available space
        visibleText = labels[i].slice(0, Math.max(0, maxChars - suffix.length))
      } else {
        // Single item with no suffix — append our own "..."
        visibleText = `${labels[i].slice(0, maxChars - 4)}...`
      }
      visibleCount = 1
    }
    break
  }

  const hiddenCount = labels.length - visibleCount
  return hiddenCount > 0 ? `${visibleText}... + ${hiddenCount}` : visibleText
}

interface ActiveFilterChipsProps {
  filterId: string
}

const ActiveFilterChips = ({ filterId }: ActiveFilterChipsProps) => {
  const { t } = useTranslation()
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const variant = getFilterVariant(filterContext, filterId)

  if (!cfg) return null

  const activeChips: { id: string; label: string }[] = []
  if (Array.isArray(cfg.state)) {
    cfg.state.forEach((valueId: string) => {
      const option = variant?.options?.find(o => o.id === valueId)
      activeChips.push({ id: valueId, label: option?.name || valueId })
    })
  } else if (cfg.state !== '') {
    const option = variant?.options?.find(o => o.id === cfg.state)
    activeChips.push({ id: cfg.state, label: option?.name || cfg.state })
  }

  if (activeChips.length === 0) return null

  const handleClear = () => {
    cfg.setState(Array.isArray(cfg.state) ? [] : '')
  }

  const totalOptions = variant?.options?.length ?? 0
  const allSelected = totalOptions > 1 && activeChips.length === totalOptions

  const labels = activeChips.map(c => c.label)
  // excluding study-period filter from truncation, looks confusing with period numbers
  const maxChars = filterId === 'study-period' ? Infinity : MAX_CHARS
  const chipLabel = allSelected ? t('filter:allSelected') : buildChipLabel(labels, maxChars)

  return (
    <Box
      component="span"
      sx={{
        zIndex: 2, // render above the mouseover highlight of accordion header
      }}
    >
      <HyChip
        label={chipLabel}
        onClick={e => {
          e?.stopPropagation()
          handleClear()
        }}
        size="small"
      />
    </Box>
  )
}

export default ActiveFilterChips
