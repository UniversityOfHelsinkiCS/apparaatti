import { Box, Tooltip } from '@mui/material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagCellState } from './TagMark.tsx'
import TagMark, { markSx } from './TagMark.tsx'

interface TagCellProps {
  rowId: string
  tagKey: string
  description: string | null
  state: TagCellState
  disabled: boolean
  onToggle: (rowId: string, tagKey: string) => void
}

export const tagStateLabels = (state: TagCellState, t: (key: string) => string): string[] => {
  const parts: string[] = []
  if (state.apparaatti === 'added') parts.push(t('v2:courseTags.state.added'))
  if (state.apparaatti === 'inherited') parts.push(t('v2:courseTags.state.inherited'))
  if (state.fromCustomCodeUrn) parts.push(t('v2:courseTags.state.customCodeUrn'))
  if (state.ignored) parts.push(t('v2:courseTags.state.ignored'))
  return parts
}

const TagCell = ({ rowId, tagKey, description, state, disabled, onToggle }: TagCellProps) => {
  const { t } = useTranslation()

  const parts = tagStateLabels(state, t)
  const label = parts.length > 0 ? parts.join(', ') : t('v2:courseTags.state.unset')
  const title = description ? `${tagKey} — ${description} (${label})` : `${tagKey} (${label})`

  return (
    <Tooltip title={title} disableInteractive>
      <Box
        component="button"
        type="button"
        onClick={() => onToggle(rowId, tagKey)}
        disabled={disabled}
        aria-label={title}
        aria-pressed={parts.length > 0}
        sx={{
          ...markSx,
          cursor: disabled ? 'default' : 'pointer',
          '&:hover:enabled': { outline: '2px solid #2563eb', outlineOffset: 1 },
          '&:focus-visible': { outline: '2px solid #2563eb', outlineOffset: 1 },
        }}
      >
        <TagMark state={state} />
      </Box>
    </Tooltip>
  )
}

export default memo(TagCell)
