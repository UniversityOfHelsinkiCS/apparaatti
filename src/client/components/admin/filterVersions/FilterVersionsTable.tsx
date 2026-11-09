import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { FilterSnapshotMeta, FilterSnapshotPayload } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import {
  deleteFilterSnapshot,
  fetchFilterSnapshotPayload,
  fetchFilterSnapshots,
  invalidateFilterVersionQueries,
  overwriteFilterSnapshot,
  updateFilterSnapshot,
} from './filterSnapshotApi.ts'

const downloadPayload = (version: FilterSnapshotMeta, payload: FilterSnapshotPayload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `filter-version-${version.id}.json`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.URL.revokeObjectURL(url)
}

const FilterVersionsTable = ({ isSuperuser }: { isSuperuser: boolean }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [importKey, setImportKey] = useState(0)

  const { data: snapshots } = useQuery({ queryKey: ['filter-snapshots'], queryFn: fetchFilterSnapshots })
  const versions = snapshots ?? []

  const rename = useMutation({
    mutationFn: ({ id, name, description }: { id: number; name: string; description: string | null }) =>
      updateFilterSnapshot(id, name, description),
    onSuccess: () => invalidateFilterVersionQueries(queryClient),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteFilterSnapshot(id),
    onSuccess: () => invalidateFilterVersionQueries(queryClient),
  })

  const importPayload = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FilterSnapshotPayload }) =>
      overwriteFilterSnapshot(id, payload),
    onSuccess: () => invalidateFilterVersionQueries(queryClient),
  })

  const handleRename = (version: FilterSnapshotMeta) => {
    const name = window.prompt(t('v2:filterVersions.renamePrompt'), version.name)
    if (!name) {
      return
    }
    rename.mutate({ id: version.id, name, description: version.description })
  }

  const handleDelete = (version: FilterSnapshotMeta) => {
    if (!window.confirm(t('v2:filterVersions.deleteConfirm', { name: version.name }))) {
      return
    }
    remove.mutate(version.id)
  }

  const handleExport = async (version: FilterSnapshotMeta) => {
    downloadPayload(version, await fetchFilterSnapshotPayload(version.id))
  }

  const handleImport = async (version: FilterSnapshotMeta, file: File | undefined) => {
    setImportKey(current => current + 1)
    if (!file) {
      return
    }

    if (!window.confirm(t('v2:filterVersions.importConfirm', { name: version.name, fileName: file.name }))) {
      return
    }

    importPayload.mutate({ id: version.id, payload: JSON.parse(await file.text()) })
  }

  const table = (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('v2:filterVersions.tableTitle')}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('v2:filterVersions.table.name')}</TableCell>
            <TableCell>{t('v2:filterVersions.table.description')}</TableCell>
            <TableCell>{t('v2:filterVersions.table.created')}</TableCell>
            <TableCell>{t('v2:filterVersions.table.status')}</TableCell>
            <TableCell>{t('v2:filterVersions.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versions.map(version => (
            <TableRow key={version.id}>
              <TableCell>{version.name}</TableCell>
              <TableCell>{version.description ?? ''}</TableCell>
              <TableCell>{new Date(version.createdAt).toLocaleString()}</TableCell>
              <TableCell>{version.isActive ? t('v2:filterVersions.activeShort') : ''}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <BlackOutlinedButton size="small" type="button" onClick={() => handleRename(version)}>
                    {t('v2:filterVersions.rename')}
                  </BlackOutlinedButton>
                  <BlackOutlinedButton size="small" type="button" onClick={() => handleExport(version)}>
                    {t('v2:filterVersions.export')}
                  </BlackOutlinedButton>
                  {isSuperuser && (
                    <BlackOutlinedButton size="small" component="label">
                      {t('v2:filterVersions.import')}
                      <input
                        key={importKey}
                        type="file"
                        accept=".json"
                        hidden
                        onChange={event => handleImport(version, event.target.files?.[0])}
                      />
                    </BlackOutlinedButton>
                  )}
                  {isSuperuser && (
                    <BlackOutlinedButton size="small" type="button" onClick={() => handleDelete(version)}>
                      {t('v2:filterVersions.delete')}
                    </BlackOutlinedButton>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )

  return table
}

export default FilterVersionsTable
