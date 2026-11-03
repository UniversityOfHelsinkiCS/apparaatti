import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { TagCellState } from './TagMark.tsx'
import TagMark, { markSx } from './TagMark.tsx'

const entries: { key: string; state: TagCellState }[] = [
  { key: 'added', state: { apparaatti: 'added', fromCustomCodeUrn: false, ignored: false } },
  { key: 'inherited', state: { apparaatti: 'inherited', fromCustomCodeUrn: false, ignored: false } },
  { key: 'customCodeUrn', state: { apparaatti: null, fromCustomCodeUrn: true, ignored: false } },
  { key: 'both', state: { apparaatti: 'inherited', fromCustomCodeUrn: true, ignored: false } },
  { key: 'ignored', state: { apparaatti: null, fromCustomCodeUrn: true, ignored: true } },
  { key: 'unset', state: { apparaatti: null, fromCustomCodeUrn: false, ignored: false } },
]

const TagLegend = () => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
      {entries.map(entry => (
        <Stack key={entry.key} direction="row" spacing={0.75} alignItems="center">
          <Box sx={markSx}>
            <TagMark state={entry.state} />
          </Box>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            {t(`v2:courseTags.state.${entry.key}`)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

export default TagLegend
