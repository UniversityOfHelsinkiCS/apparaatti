import { Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll } from '../../../../common/conditionMatching.ts'
import type { FilterConfig, FilterOption, FilterVariant } from '../../../../common/types.ts'
import RowActionsCell from '../RowActionsCell.tsx'
import VariantDialog from './VariantDialog.tsx'

interface VariantsTabProps {
  variants: FilterConfig['variants']
  canAddVariant: boolean
  onPatchVariant: (vIdx: number, fields: Partial<FilterVariant>) => void
  onPatchVariantQuestion: (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onPatchVariantExplanation: (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onUpdateOption: (vIdx: number, oIdx: number, fields: Partial<FilterOption>) => void
  onUpdateOptionName: (vIdx: number, oIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onAddOption: (vIdx: number) => void
  onRemoveOption: (vIdx: number, oIdx: number) => void
  onAddVariant: (
    conditions: Pick<FilterVariant, 'organisationCode' | 'lang' | 'primaryLanguage' | 'primaryLanguageSpecification'>
  ) => void
  onRemoveVariant: (vIdx: number) => void
}

const blankConditions = {
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
}

const VariantsTab = ({
  variants,
  canAddVariant,
  onPatchVariant,
  onPatchVariantQuestion,
  onPatchVariantExplanation,
  onUpdateOption,
  onUpdateOptionName,
  onAddOption,
  onRemoveOption,
  onAddVariant,
  onRemoveVariant,
}: VariantsTabProps) => {
  const { t } = useTranslation()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const anyLabel = t('v2:admin.backendLocales.anyValue')

  const conditionLabel = (value: string | null) => (value === null ? anyLabel : value)
  const hasCatchAll = variants.some(isCatchAll)

  const editingVariant = editingIdx !== null ? variants[editingIdx] : null

  return (
    <Box sx={{ pt: 1 }}>
      {!hasCatchAll && (
        <Chip
          size="small"
          sx={{ mb: 1, backgroundColor: '#fff4e5', color: '#663c00' }}
          label={t('v2:admin.filterEdit.noCatchAllWarning')}
        />
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('v2:admin.backendLocales.organisation')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.lang')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.primaryLanguage')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.specification')}</TableCell>
            <TableCell>{t('v2:admin.filterEdit.questionText')}</TableCell>
            <TableCell>{t('v2:admin.filterEdit.skipped')}</TableCell>
            <TableCell>{t('v2:admin.filterEdit.tableActions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant, vIdx) => (
            <TableRow key={vIdx}>
              <TableCell>{conditionLabel(variant.organisationCode)}</TableCell>
              <TableCell>{conditionLabel(variant.lang)}</TableCell>
              <TableCell>{conditionLabel(variant.primaryLanguage)}</TableCell>
              <TableCell>{conditionLabel(variant.primaryLanguageSpecification)}</TableCell>
              <TableCell>{variant.question.fi.slice(0, 60)}</TableCell>
              <TableCell>{variant.skipped ? t('v2:admin.filterEdit.yes') : ''}</TableCell>
              <RowActionsCell
                editLabel={t('v2:admin.filterEdit.editVariant')}
                deleteLabel={t('v2:admin.filterEdit.deleteVariant')}
                onEdit={() => setEditingIdx(vIdx)}
                onDelete={() => {
                  if (window.confirm(t('v2:admin.filterEdit.confirmDeleteVariant'))) {
                    onRemoveVariant(vIdx)
                  }
                }}
                canDelete={!isCatchAll(variant)}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {canAddVariant && (
        <Button
          startIcon={<Plus size={20} />}
          size="small"
          onClick={() => {
            onAddVariant(blankConditions)
            setEditingIdx(variants.length)
          }}
          sx={{ color: 'black', mt: 1 }}
        >
          {t('v2:admin.filterEdit.addVariant')}
        </Button>
      )}

      {editingVariant && editingIdx !== null && (
        <VariantDialog
          variant={editingVariant}
          onClose={() => setEditingIdx(null)}
          onPatchVariant={fields => onPatchVariant(editingIdx, fields)}
          onPatchQuestion={(lang, val) => onPatchVariantQuestion(editingIdx, lang, val)}
          onPatchExplanation={(lang, val) => onPatchVariantExplanation(editingIdx, lang, val)}
          onUpdateOption={(oIdx, fields) => onUpdateOption(editingIdx, oIdx, fields)}
          onUpdateOptionName={(oIdx, lang, val) => onUpdateOptionName(editingIdx, oIdx, lang, val)}
          onAddOption={() => onAddOption(editingIdx)}
          onRemoveOption={oIdx => onRemoveOption(editingIdx, oIdx)}
        />
      )}
    </Box>
  )
}

export default VariantsTab
