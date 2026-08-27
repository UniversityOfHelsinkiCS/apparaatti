import { Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { FilterOption, FilterVariant } from '../../../../common/types.ts'
import { SWITCH_SX } from './filterEditorUtils.ts'
import LocalizedField from './LocalizedField.tsx'
import OptionRow from './OptionRow.tsx'

interface VariantEditorProps {
  variant: FilterVariant
  variantIdx: number
  onPatchVariant: (fields: Partial<FilterVariant>) => void
  onPatchQuestion: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onPatchExplanation: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onUpdateOption: (oIdx: number, fields: Partial<FilterOption>) => void
  onUpdateOptionName: (oIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onAddOption: () => void
  onRemoveOption: (oIdx: number) => void
}

const VariantEditor = ({
  variant,
  onPatchVariant,
  onPatchQuestion,
  onPatchExplanation,
  onUpdateOption,
  onUpdateOptionName,
  onAddOption,
  onRemoveOption,
}: VariantEditorProps) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      <TextField
        label={t('v2:admin.filterEdit.variantName')}
        size="small"
        value={variant.name}
        onChange={e => onPatchVariant({ name: e.target.value })}
        disabled={variant.name === 'default'}
      />
      <FormControlLabel
        label={t('v2:admin.filterEdit.skipped')}
        control={
          <Switch
            checked={!!variant.skipped}
            onChange={e => onPatchVariant({ skipped: e.target.checked })}
            sx={SWITCH_SX}
          />
        }
      />

      <Typography variant="subtitle2">{t('v2:admin.filterEdit.questionText')}</Typography>
      <LocalizedField
        values={variant.question}
        onChange={onPatchQuestion}
        textFieldLabel={t('v2:admin.filterEdit.questionText')}
        multiline
        minRows={2}
      />

      <Typography variant="subtitle2">{t('v2:admin.filterEdit.explanationOverride')}</Typography>
      <LocalizedField
        values={variant.explanation ?? { fi: '', sv: '', en: '' }}
        onChange={onPatchExplanation}
        textFieldLabel={t('v2:admin.filterEdit.explanationOverrideField')}
        multiline
        minRows={2}
      />

      <Divider />
      <Typography variant="subtitle2">
        {t('v2:admin.filterEdit.options', { amount: (variant.options ?? []).length })}
      </Typography>
      {(variant.options ?? []).map((option, oIdx) => (
        <OptionRow
          key={oIdx}
          option={option}
          onUpdate={fields => onUpdateOption(oIdx, fields)}
          onUpdateName={(lang, val) => onUpdateOptionName(oIdx, lang, val)}
          onRemove={() => onRemoveOption(oIdx)}
        />
      ))}
      <Button
        startIcon={<Plus size={20} />}
        size="small"
        onClick={onAddOption}
        sx={{ color: 'black', alignSelf: 'flex-start' }}
      >
        {t('v2:admin.filterEdit.addOption')}
      </Button>
    </Box>
  )
}

export default VariantEditor
