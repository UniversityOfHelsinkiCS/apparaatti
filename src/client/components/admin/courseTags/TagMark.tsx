import { Box } from '@mui/material'

import type { ApparaattiTagSource } from '../../../../common/types.ts'

export type TagCellState = {
  apparaatti: ApparaattiTagSource | null
  fromCustomCodeUrn: boolean
  ignored: boolean
}

export const APPARAATTI = '#166534'
export const CUSTOM_CODE_URN = '#1d4ed8'
export const OVERRIDE = '#b91c1c'
export const MUTED = '#6b7280'

const slotSx = {
  width: 15,
  height: 20,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 0.5,
}

const apparaattiSlotSx = (state: TagCellState) => {
  if (state.ignored) return { ...slotSx, backgroundColor: OVERRIDE, color: '#ffffff' }
  if (state.apparaatti === 'added') return { ...slotSx, backgroundColor: APPARAATTI, color: '#ffffff' }
  if (state.apparaatti === 'inherited') return { ...slotSx, color: APPARAATTI, border: `2px solid ${APPARAATTI}` }
  return slotSx
}

const customCodeUrnSlotSx = (state: TagCellState) => {
  if (!state.fromCustomCodeUrn) return slotSx
  if (state.ignored) return { ...slotSx, color: MUTED, border: `2px solid ${MUTED}` }
  return { ...slotSx, backgroundColor: '#eff6ff', color: CUSTOM_CODE_URN, border: `2px solid ${CUSTOM_CODE_URN}` }
}

export const markSx = {
  width: 36,
  height: 26,
  p: 0,
  borderRadius: 1,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: MUTED,
  backgroundColor: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
}

const TagMark = ({ state }: { state: TagCellState }) => (
  <>
    <Box component="span" sx={apparaattiSlotSx(state)}>
      {state.apparaatti || state.ignored ? 'A' : ''}
    </Box>
    <Box component="span" sx={customCodeUrnSlotSx(state)}>
      {state.fromCustomCodeUrn ? 'S' : ''}
    </Box>
  </>
)

export default TagMark
