import { Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { FilterOption, FilterVariant } from '../../../../common/types.ts'
import { SWITCH_SX } from './filterEditorUtils.ts'
import OptionRow from './OptionRow.tsx'
import LocalizedField from './LocalizedField.tsx'

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
}: VariantEditorProps) => (
  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
    <TextField
      label="Variant name"
      size="small"
      value={variant.name}
      onChange={(e) => onPatchVariant({ name: e.target.value })}
      disabled={variant.name === 'default'}
    />
    <FormControlLabel
      label="Skipped"
      control={
        <Switch
          checked={!!variant.skipped}
          onChange={(e) => onPatchVariant({ skipped: e.target.checked })}
          sx={SWITCH_SX}
        />
      }
    />

    <Typography variant="subtitle2">Question text</Typography>
    <LocalizedField
      values={variant.question}
      onChange={onPatchQuestion}
      textFieldLabel="Question text"
      multiline
      minRows={2}
    />

    <Typography variant="subtitle2">Explanation override (optional)</Typography>
    <LocalizedField
      values={variant.explanation ?? { fi: '', sv: '', en: '' }}
      onChange={onPatchExplanation}
      textFieldLabel="Explanation override"
      multiline
      minRows={2}
    />

    <Divider />
    <Typography variant="subtitle2">
      Options ({(variant.options ?? []).length})
    </Typography>
    {(variant.options ?? []).map((option, oIdx) => (
      <OptionRow
        key={oIdx}
        option={option}
        onUpdate={(fields) => onUpdateOption(oIdx, fields)}
        onUpdateName={(lang, val) => onUpdateOptionName(oIdx, lang, val)}
        onRemove={() => onRemoveOption(oIdx)}
      />
    ))}
    <Button
      startIcon={<AddIcon />}
      size="small"
      onClick={onAddOption}
      sx={{ color: 'black', alignSelf: 'flex-start' }}
    >
      Add option
    </Button>
  </Box>
)

export default VariantEditor
