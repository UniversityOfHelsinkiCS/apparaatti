import { Box, Tooltip } from '@mui/material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { ResolvedTagSource } from '../../../../common/types.ts'

export type TagCellState = ResolvedTagSource | 'unset'

interface TagCellProps {
  rowId: string
  tagKey: string
  description: string | null
  state: TagCellState
  onToggle: (rowId: string, tagKey: string) => void
}

const glyph: Record<TagCellState, string> = {
  added: '✓',
  inherited: '↓',
  ignored: '✕',
  unset: '',
}

const stateSx: Record<TagCellState, object> = {
  added: { backgroundColor: '#111827', color: '#ffffff', borderColor: '#111827' },
  inherited: { backgroundColor: '#ffffff', color: '#111827', borderColor: '#111827', borderWidth: 2 },
  ignored: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#6b7280', borderStyle: 'dashed' },
  unset: { backgroundColor: '#ffffff', color: 'transparent', borderColor: '#6b7280' },
}

const TagCell = ({ rowId, tagKey, description, state, onToggle }: TagCellProps) => {
  const { t } = useTranslation()

  const label = t(`v2:courseTags.state.${state}`)
  const title = description ? `${tagKey} — ${description} (${label})` : `${tagKey} (${label})`

  return (
    <Tooltip title={title} disableInteractive>
      <Box
        component="button"
        type="button"
        onClick={() => onToggle(rowId, tagKey)}
        aria-label={title}
        aria-pressed={state !== 'unset'}
        sx={{
          width: 26,
          height: 26,
          p: 0,
          borderRadius: 1,
          borderStyle: 'solid',
          borderWidth: 1,
          fontSize: 14,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { outline: '2px solid #2563eb', outlineOffset: 1 },
          '&:focus-visible': { outline: '2px solid #2563eb', outlineOffset: 1 },
          ...stateSx[state],
        }}
      >
        {glyph[state]}
      </Box>
    </Tooltip>
  )
}

export default memo(TagCell)
