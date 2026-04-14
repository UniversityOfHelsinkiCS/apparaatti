import { useState } from 'react'
import { Box, Button, IconButton, List, ListItemButton, ListItemText } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type { FilterConfig, FilterOption, FilterVariant } from '../../../../common/types.ts'
import VariantEditor from './VariantEditor.tsx'

interface Props {
  variants: FilterConfig['variants']
  onPatchVariant: (vIdx: number, fields: Partial<FilterVariant>) => void
  onPatchVariantQuestion: (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onPatchVariantExplanation: (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onUpdateOption: (vIdx: number, oIdx: number, fields: Partial<FilterOption>) => void
  onUpdateOptionName: (vIdx: number, oIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onAddOption: (vIdx: number) => void
  onRemoveOption: (vIdx: number, oIdx: number) => void
  onAddVariant: () => void
  onRemoveVariant: (vIdx: number) => void
}

const VariantsTab = ({
  variants,
  onPatchVariant,
  onPatchVariantQuestion,
  onPatchVariantExplanation,
  onUpdateOption,
  onUpdateOptionName,
  onAddOption,
  onRemoveOption,
  onAddVariant,
  onRemoveVariant,
}: Props) => {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const safeIdx = Math.min(selectedIdx, variants.length - 1)
  const selectedVariant = variants[safeIdx]

  return (
    <Box sx={{ display: 'flex', gap: 2, pt: 1, minHeight: 400 }}>
      {/* Left: variant list */}
      <Box
        sx={{
          width: 180,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List dense disablePadding sx={{ flexGrow: 1 }}>
          {variants.map((v, vIdx) => (
            <ListItemButton
              key={vIdx}
              selected={vIdx === safeIdx}
              onClick={() => setSelectedIdx(vIdx)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': { backgroundColor: 'rgba(0,0,0,0.08)' },
              }}
            >
              <ListItemText
                primary={v.name || `Variant ${vIdx + 1}`}
                primaryTypographyProps={{ fontSize: 14, noWrap: true }}
              />
              {v.name !== 'default' && (
                <IconButton
                  size="small"
                  edge="end"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation()
                    const newIdx = vIdx <= safeIdx && safeIdx > 0 ? safeIdx - 1 : safeIdx
                    setSelectedIdx(newIdx)
                    onRemoveVariant(vIdx)
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </ListItemButton>
          ))}
        </List>
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={() => {
            onAddVariant()
            setSelectedIdx(variants.length)
          }}
          sx={{ color: 'black', mt: 1 }}
        >
          Add variant
        </Button>
      </Box>

      {/* Right: selected variant editor */}
      {selectedVariant && (
        <VariantEditor
          variant={selectedVariant}
          variantIdx={safeIdx}
          onPatchVariant={(fields) => onPatchVariant(safeIdx, fields)}
          onPatchQuestion={(lang, val) => onPatchVariantQuestion(safeIdx, lang, val)}
          onPatchExplanation={(lang, val) => onPatchVariantExplanation(safeIdx, lang, val)}
          onUpdateOption={(oIdx, fields) => onUpdateOption(safeIdx, oIdx, fields)}
          onUpdateOptionName={(oIdx, lang, val) => onUpdateOptionName(safeIdx, oIdx, lang, val)}
          onAddOption={() => onAddOption(safeIdx)}
          onRemoveOption={(oIdx) => onRemoveOption(safeIdx, oIdx)}
        />
      )}
    </Box>
  )
}

export default VariantsTab
