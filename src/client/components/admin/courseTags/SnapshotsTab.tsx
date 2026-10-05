import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagPayloadDiff } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import {
  COURSE_TAGS_PATH,
  createSnapshot,
  deleteSnapshot,
  fetchSnapshotDiff,
  fetchSnapshots,
  restoreSnapshot,
} from './courseTagUtils.ts'
import { matrixContainerSx } from './matrixStyles.ts'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'

interface SnapshotsTabProps {
  isSuperuser: boolean
}

const SnapshotsTab = ({ isSuperuser }: SnapshotsTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [diff, setDiff] = useState<TagPayloadDiff | null>(null)

  const { data: snapshots } = useQuery({ queryKey: ['course-tag-snapshots'], queryFn: fetchSnapshots })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['course-tag-snapshots'] })
    await queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })
    await queryClient.invalidateQueries({ queryKey: ['course-tags'] })
  }

  const handleSave = async () => {
    await createSnapshot(name, description || null)
    setName('')
    setDescription('')
    await refresh()
  }

  const handleRestore = async (id: number, snapshotName: string) => {
    if (!window.confirm(t('v2:courseTags.snapshots.restoreConfirm', { name: snapshotName }))) return
    await restoreSnapshot(id)
    await refresh()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('v2:courseTags.snapshots.deleteConfirm'))) return
    await deleteSnapshot(id)
    await refresh()
  }

  const handleExport = async () => {
    const response = await adminFetch('GET', `${COURSE_TAGS_PATH}/export`)
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
    await refresh()
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          size="small"
          label={t('v2:courseTags.snapshots.name')}
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <TextField
          size="small"
          fullWidth
          label={t('v2:courseTags.snapshots.description')}
          value={description}
          onChange={event => setDescription(event.target.value)}
        />
        <BlackOutlinedButton type="button" onClick={handleSave} disabled={name.trim().length === 0}>
          {t('v2:courseTags.snapshots.save')}
        </BlackOutlinedButton>
      </Stack>

      {isSuperuser ? (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <BlackOutlinedButton type="button" onClick={handleExport}>
            {t('v2:courseTags.snapshots.export')}
          </BlackOutlinedButton>
          <BlackOutlinedButton type="button" component="label">
            {t('v2:courseTags.snapshots.import')}
            <input type="file" accept="application/json" hidden onChange={handleImportFile} />
          </BlackOutlinedButton>
        </Stack>
      ) : null}

      <TableContainer sx={matrixContainerSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('v2:courseTags.snapshots.name')}</TableCell>
              <TableCell>{t('v2:courseTags.snapshots.description')}</TableCell>
              <TableCell>{t('v2:courseTags.snapshots.createdAt')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {(snapshots ?? []).map(snapshot => (
              <TableRow key={snapshot.id}>
                <TableCell>{snapshot.name}</TableCell>
                <TableCell>{snapshot.description ?? ''}</TableCell>
                <TableCell>{new Date(snapshot.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <BlackOutlinedButton
                      type="button"
                      onClick={async () => setDiff(await fetchSnapshotDiff(snapshot.id))}
                    >
                      {t('v2:courseTags.snapshots.compare')}
                    </BlackOutlinedButton>
                    {isSuperuser ? (
                      <BlackOutlinedButton type="button" onClick={() => handleRestore(snapshot.id, snapshot.name)}>
                        {t('v2:courseTags.snapshots.restore')}
                      </BlackOutlinedButton>
                    ) : null}
                    {isSuperuser ? (
                      <BlackOutlinedButton type="button" onClick={() => handleDelete(snapshot.id)}>
                        {t('v2:courseTags.snapshots.delete')}
                      </BlackOutlinedButton>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {(snapshots ?? []).length === 0 ? (
        <Typography sx={{ mt: 2 }}>{t('v2:courseTags.snapshots.empty')}</Typography>
      ) : null}

      <SnapshotDiffDialog diff={diff} onClose={() => setDiff(null)} />
    </Box>
  )
}

export default SnapshotsTab
