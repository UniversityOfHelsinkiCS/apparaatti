import { useState } from 'react'

import type { FilterSnapshotMeta } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import useApi from '../../util/useApi'
import EditModePanel from './EditModePanel'
import EditModeSavedSnackbar from './EditModeSavedSnackbar'
import ExitEditModeDialog from './ExitEditModeDialog'
import HiddenFilterWordingsDialog from './HiddenFilterWordingsDialog'
import WordingEditPopover from './WordingEditPopover'

const FilterEditModeOverlay = () => {
  const { isEditMode, editingVersionId, exitEditMode } = useFilterEditMode()
  const [isHiddenOpen, setIsHiddenOpen] = useState(false)
  const [isExitOpen, setIsExitOpen] = useState(false)
  const { data: snapshots } = useApi<FilterSnapshotMeta[]>(
    'filter-snapshots',
    '/api/admin/filter-config/snapshots',
    'GET'
  )

  if (!isEditMode) {
    return null
  }

  const versionName =
    (snapshots ?? []).find(snapshot => snapshot.id === editingVersionId)?.name ?? String(editingVersionId)

  return (
    <>
      <EditModePanel
        versionName={versionName}
        onOpenHiddenWordings={() => setIsHiddenOpen(true)}
        onExit={() => setIsExitOpen(true)}
      />
      <HiddenFilterWordingsDialog open={isHiddenOpen} onClose={() => setIsHiddenOpen(false)} />
      <ExitEditModeDialog
        open={isExitOpen}
        versionId={editingVersionId}
        versionName={versionName}
        onClose={() => setIsExitOpen(false)}
        onConfirm={() => {
          setIsExitOpen(false)
          exitEditMode()
        }}
      />
      <EditModeSavedSnackbar />
      <WordingEditPopover />
    </>
  )
}

export default FilterEditModeOverlay
