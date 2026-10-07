import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CurTagMutationMode } from './courseTagUtils.ts'

const modes = ['add', 'ignore', 'clear'] as const

interface BulkModeRadioGroupProps {
  mode: CurTagMutationMode
  onChange: (mode: CurTagMutationMode) => void
}

const BulkModeRadioGroup = ({ mode, onChange }: BulkModeRadioGroupProps) => {
  const { t } = useTranslation()

  return (
    <RadioGroup value={mode} onChange={event => onChange(event.target.value as CurTagMutationMode)}>
      {modes.map(option => (
        <FormControlLabel
          key={option}
          value={option}
          control={<Radio sx={{ color: '#374151', alignSelf: 'flex-start', '&.Mui-checked': { color: '#111827' } }} />}
          sx={{ alignItems: 'flex-start', mb: 1, mr: 0 }}
          label={
            <Box sx={{ pt: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                {t(`v2:courseTags.bulk.mode.${option}.label`)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151' }}>
                {t(`v2:courseTags.bulk.mode.${option}.description`)}
              </Typography>
            </Box>
          }
        />
      ))}
    </RadioGroup>
  )
}

export default BulkModeRadioGroup
