import { useState } from 'react'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
} from '@mui/material'
import type { FilterConfig } from '../../../common/types.ts'
import { adminFetch, toNullIfEmpty } from './filterEdit/filterEditorUtils.ts'
import { useFilterDraft } from './filterEdit/useFilterDraft.ts'
import GeneralTab from './filterEdit/GeneralTab.tsx'
import VariantsTab from './filterEdit/VariantsTab.tsx'

interface FilterEditDialogProps {
  filter: FilterConfig | null
  isSuperuser: boolean
  onClose: () => void
  onSaved: () => void
}

const FilterEditDialog = ({ filter, isSuperuser, onClose, onSaved }: FilterEditDialogProps) => {
  const isCreate = filter === null
  const {
    draft,
    patch,
    patchShortName,
    patchExplanation,
    patchExtraInfo,
    patchVariant,
    patchVariantQuestion,
    patchVariantExplanation,
    updateOption,
    updateOptionName,
    addOption,
    removeOption,
    addVariant,
    removeVariant,
  } = useFilterDraft(filter)

  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { id, ...rest } = draft
      const body = {
        ...rest,
        displayType: rest.displayType || null,
        explanation: toNullIfEmpty(rest.explanation as { fi: string; sv: string; en: string }),
        extraInfo: toNullIfEmpty(rest.extraInfo as { fi: string; sv: string; en: string }),
      }
      const res = isCreate
        ? await adminFetch('POST', '/api/admin/filter-config', { id, ...body })
        : await adminFetch('PUT', `/api/admin/filter-config/${id}`, body)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError((json as { message?: string }).message ?? 'Unknown error')
      } else {
        onSaved()
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>{isCreate ? 'Create filter' : `Edit: ${draft.id}`}</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as number)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
          textColor="inherit"
        >
          <Tab label="General" />
          <Tab label={`Variants (${draft.variants.length})`} />
        </Tabs>

        {tab === 0 && (
          <GeneralTab
            draft={draft}
            isCreate={isCreate}
            patch={patch}
            patchShortName={patchShortName}
            patchExplanation={patchExplanation}
            patchExtraInfo={patchExtraInfo}
          />
        )}

        {tab === 1 && (
          <VariantsTab
            variants={draft.variants}
            canAddVariant={isSuperuser}
            onPatchVariant={patchVariant}
            onPatchVariantQuestion={patchVariantQuestion}
            onPatchVariantExplanation={patchVariantExplanation}
            onUpdateOption={updateOption}
            onUpdateOptionName={updateOptionName}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onAddVariant={addVariant}
            onRemoveVariant={removeVariant}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          Save
        </Button>
      </DialogActions>
      <Snackbar
        open={error !== null}
        message={error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      />
    </Dialog>
  )
}

export default FilterEditDialog
