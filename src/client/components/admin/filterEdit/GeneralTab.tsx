import { Box, FormControlLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

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
  'mandatory',
  'showInWelcomeModal',
  'hideInCurrentFiltersDisplay',
  'hideInFilterSidebar',
  'enabled',
] as const

const GeneralTab = ({ draft, isCreate, patch, patchShortName, patchExplanation, patchExtraInfo }: GeneralTabProps) => {
  const { t } = useTranslation()
  const explanationVal = draft.explanation as { fi: string; sv: string; en: string } | undefined
  const extraInfoVal = draft.extraInfo as { fi: string; sv: string; en: string } | undefined

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label={t('v2:admin.filterEdit.id')}
        value={draft.id}
        onChange={e => patch({ id: e.target.value })}
        disabled={!isCreate}
        helperText={isCreate ? t('v2:admin.filterEdit.idHelper') : ''}
      />
      <Box>
        <Typography variant="caption" color="text.secondary">
          {t('v2:admin.filterEdit.displayType')}
        </Typography>
        <Select
          fullWidth
          value={draft.displayType ?? ''}
          onChange={e => patch({ displayType: (e.target.value as string) || null })}
        >
          <MenuItem value="">{t('v2:admin.filterEdit.displayTypeNone')}</MenuItem>
          {DISPLAY_TYPES.map(displayType => (
            <MenuItem key={displayType} value={displayType}>
              {displayType}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <TextField
        label={t('v2:admin.filterEdit.displayOrder')}
        type="number"
        value={draft.displayOrder}
        onChange={e => patch({ displayOrder: Number(e.target.value) })}
      />
      <TextField
        label={t('v2:admin.filterEdit.parentFilterId')}
        value={draft.parentFilterId ?? ''}
        onChange={e => patch({ parentFilterId: e.target.value || null })}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {BOOL_FIELDS.map(field => (
          <FormControlLabel
            key={field}
            label={t(`v2:admin.filterEdit.${field}`)}
            control={
              <Switch checked={!!draft[field]} onChange={e => patch({ [field]: e.target.checked })} sx={SWITCH_SX} />
            }
          />
        ))}
      </Box>

      <Typography variant="subtitle2">{t('v2:admin.filterEdit.shortName')}</Typography>
      <LocalizedField
        values={draft.shortName}
        onChange={patchShortName}
        textFieldLabel={t('v2:admin.filterEdit.shortName')}
      />

      <Typography variant="subtitle2">
        {t('v2:admin.filterEdit.explanation')}{' '}
        <Typography component="span" variant="caption" color="text.secondary">
          {t('v2:admin.filterEdit.explanationHint')}
        </Typography>
      </Typography>
      <LocalizedField
        values={explanationVal ?? { fi: '', sv: '', en: '' }}
        onChange={patchExplanation}
        textFieldLabel={t('v2:admin.filterEdit.explanation')}
        multiline
        minRows={2}
      />

      <Typography variant="subtitle2">
        {t('v2:admin.filterEdit.extraInfo')}{' '}
        <Typography component="span" variant="caption" color="text.secondary">
          {t('v2:admin.filterEdit.extraInfoHint')}
        </Typography>
      </Typography>
      <LocalizedField
        values={extraInfoVal ?? { fi: '', sv: '', en: '' }}
        onChange={patchExtraInfo}
        textFieldLabel={t('v2:admin.filterEdit.extraInfo')}
        multiline
        minRows={2}
      />
    </Box>
  )
}

export default GeneralTab
