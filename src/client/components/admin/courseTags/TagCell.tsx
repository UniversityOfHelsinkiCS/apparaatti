import { Box, Chip, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResolvedTagSource } from '../../../../common/types.ts'

export type TagCellState = ResolvedTagSource | 'unset'

interface TagCellProps {
  tagKey: string
  description: string | null
  state: TagCellState
  onClick: () => void
}

const stateSx = {
  added: { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' },
  inherited: { backgroundColor: 'transparent', color: '#111827', borderColor: '#111827' },
  ignored: {
    backgroundColor: 'transparent',
    color: '#9ca3af',
    borderColor: '#d1d5db',
    textDecoration: 'line-through',
  },
  unset: { backgroundColor: 'transparent', color: '#d1d5db', borderColor: '#e5e7eb' },
} as const

const TagCell = ({ tagKey, description, state, onClick }: TagCellProps) => {
  const { t } = useTranslation()

  const label = t(`v2:courseTags.state.${state}`)
  const title = description ? `${tagKey} — ${description} (${label})` : `${tagKey} (${label})`

  return (
    <Tooltip title={title}>
      <Box component="span">
        <Chip
          label={tagKey}
          size="small"
          variant="outlined"
          onClick={onClick}
          aria-label={title}
          sx={{ ...stateSx[state], cursor: 'pointer', fontWeight: state === 'added' ? 600 : 400 }}
        />
      </Box>
    </Tooltip>
  )
}

export default TagCell
