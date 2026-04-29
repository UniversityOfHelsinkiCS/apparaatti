import { Box, FormControlLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material'
import type { FilterConfig } from '../../../../common/types.ts'
import { DISPLAY_TYPES, SWITCH_SX } from './filterEditorUtils.ts'
import LocalizedField from './LocalizedField.tsx'

interface GeneralTabProps {
  draft: FilterConfig
  isCreate: boolean
  patch: (fields: Partial<FilterConfig>) => void
  patchShortName: (lang: 'fi' | 'sv' | 'en', val: string) => void
  patchExplanation: (lang: 'fi' | 'sv' | 'en', val: string) => void
  patchExtraInfo: (lang: 'fi' | 'sv' | 'en', val: string) => void
}

const BOOL_FIELDS = [
  ['mandatory', 'Mandatory'],
  ['superToggle', 'Super toggle'],
  ['showInWelcomeModal', 'Show in welcome modal'],
  ['hideInCurrentFiltersDisplay', 'Hide in current filters'],
  ['hideInRecommendationReasons', 'Hide in rec. reasons'],
  ['hideInFilterSidebar', 'Hide in sidebar'],
  ['isStrictByDefault', 'Strict by default'],
  ['enabled', 'Enabled'],
] as const

const GeneralTab = ({ draft, isCreate, patch, patchShortName, patchExplanation, patchExtraInfo }: GeneralTabProps) => {
  const explanationVal = draft.explanation as { fi: string; sv: string; en: string } | undefined
  const extraInfoVal = draft.extraInfo as { fi: string; sv: string; en: string } | undefined

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="ID"
        value={draft.id}
        onChange={(e) => patch({ id: e.target.value })}
        disabled={!isCreate}
        helperText={isCreate ? 'Lowercase alphanumeric + hyphens' : ''}
      />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Display type
        </Typography>
        <Select
          fullWidth
          value={draft.displayType ?? ''}
          onChange={(e) => patch({ displayType: (e.target.value as string) || null })}
        >
          <MenuItem value="">— none —</MenuItem>
          {DISPLAY_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <TextField
        label="Display order"
        type="number"
        value={draft.displayOrder}
        onChange={(e) => patch({ displayOrder: Number(e.target.value) })}
      />
      <TextField
        label="Parent filter ID (optional)"
        value={draft.parentFilterId ?? ''}
        onChange={(e) => patch({ parentFilterId: e.target.value || null })}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {BOOL_FIELDS.map(([field, label]) => (
          <FormControlLabel
            key={field}
            label={label}
            control={
              <Switch
                checked={!!draft[field]}
                onChange={(e) => patch({ [field]: e.target.checked })}
                sx={SWITCH_SX}
              />
            }
          />
        ))}
      </Box>

      <Typography variant="subtitle2">Short name</Typography>
      <LocalizedField
        values={draft.shortName}
        onChange={patchShortName}
        textFieldLabel="Short name"
      />

      <Typography variant="subtitle2">Explanation (optional) <Typography component="span" variant="caption" color="text.secondary">(the question icon)</Typography></Typography>
      <LocalizedField
        values={explanationVal ?? { fi: '', sv: '', en: '' }}
        onChange={patchExplanation}
        textFieldLabel="Explanation"
        multiline
        minRows={2}
      />

      <Typography variant="subtitle2">Extra info (optional) <Typography component="span" variant="caption" color="text.secondary">(shown when display type is info-only)</Typography></Typography>
      <LocalizedField
        values={extraInfoVal ?? { fi: '', sv: '', en: '' }}
        onChange={patchExtraInfo}
        textFieldLabel="Extra info"
        multiline
        minRows={2}
      />
    </Box>
  )
}

export default GeneralTab
