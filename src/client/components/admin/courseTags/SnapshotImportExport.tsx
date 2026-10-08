import { Stack } from '@mui/material'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagBase } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import { COURSE_TAGS_PATH } from './courseTagUtils.ts'
import { baseKey } from './tagVersionState.ts'

interface SnapshotImportExportProps {
  base: TagBase
  onImported: () => Promise<void>
}

const SnapshotImportExport = ({ base, onImported }: SnapshotImportExportProps) => {
  const { t } = useTranslation()

  const handleExport = async () => {
    const response = await adminFetch('GET', `${COURSE_TAGS_PATH}/export?base=${baseKey(base)}`)
    if (!response.ok) {
      window.alert(t('v2:courseTags.snapshots.exportFailed'))
      return
    }

    const url = window.URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = url
    link.download = `course-tags-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const data = JSON.parse(await file.text())
    if (!window.confirm(t('v2:courseTags.snapshots.importConfirm', { fileName: file.name }))) return

    const response = await adminFetch('POST', `${COURSE_TAGS_PATH}/import`, data)
    if (!response.ok) {
      window.alert(t('v2:courseTags.snapshots.importFailed'))
      return
    }

    event.target.value = ''
    await onImported()
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <BlackOutlinedButton type="button" onClick={handleExport}>
        {t('v2:courseTags.snapshots.export')}
      </BlackOutlinedButton>
      <BlackOutlinedButton type="button" component="label">
        {t('v2:courseTags.snapshots.import')}
        <input type="file" accept="application/json" hidden onChange={handleImportFile} />
      </BlackOutlinedButton>
    </Stack>
  )
}

export default SnapshotImportExport
