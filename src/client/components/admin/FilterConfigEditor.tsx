import {
  Box,
  Button,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useState } from 'react'

import type { FilterConfig } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import FilterEditDialog from './FilterEditDialog.tsx'

interface FilterConfigEditorProps {
  isSuperuser: boolean
}

const adminFetch = (method: string, path: string, body?: unknown) =>
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

const FilterConfigEditor = ({ isSuperuser }: FilterConfigEditorProps) => {
  const {
    data: filters,
    isLoading,
    refetch,
  } = useApi<FilterConfig[]>('admin-filter-config', '/api/admin/filter-config', 'GET')
  const [editTarget, setEditTarget] = useState<FilterConfig | 'new' | null>(null)
  const [restoringFilterId, setRestoringFilterId] = useState<string | null>(null)
  const [filtersWithoutSeedDefaults, setFiltersWithoutSeedDefaults] = useState<string[]>([])
  const [importFileInputKey, setImportFileInputKey] = useState<number>(0)

  if (isLoading) return <Typography>Loading filters...</Typography>

  const filterList: FilterConfig[] = filters ?? []

  const handleToggleEnabled = async (filter: FilterConfig) => {
    await adminFetch('PUT', `/api/admin/filter-config/${filter.id}`, {
      ...filter,
      enabled: !filter.enabled,
    })
    refetch()
  }

  const move = async (index: number, direction: 1 | -1) => {
    const a = filterList[index]
    const b = filterList[index + direction]
    await adminFetch('PATCH', '/api/admin/filter-config/reorder', [
      { id: a.id, displayOrder: b.displayOrder },
      { id: b.id, displayOrder: a.displayOrder },
    ])
    refetch()
  }

  const handleRestoreDefaults = async (filterId: string) => {
    const shouldRestore = window.confirm(
      'Restore this filter to seeded defaults? This will overwrite current settings.'
    )
    if (!shouldRestore) {
      return
    }

    setRestoringFilterId(filterId)

    try {
      const response = await adminFetch('POST', `/api/admin/filter-config/${filterId}/restore`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        if (response.status === 404) {
          setFiltersWithoutSeedDefaults(current => (current.includes(filterId) ? current : [...current, filterId]))
          window.alert(errorData?.message ?? 'This filter has no seeded defaults to restore')
          return
        }

        window.alert(errorData?.message ?? 'Failed to restore filter defaults')
        return
      }

      setFiltersWithoutSeedDefaults(current => current.filter(id => id !== filterId))
      refetch()
    } finally {
      setRestoringFilterId(null)
    }
  }

  const handleExport = async () => {
    try {
      const response = await adminFetch('GET', '/api/admin/filter-config/export')
      if (!response.ok) {
        window.alert('Failed to export filter configuration')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `filter-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      window.alert('Failed to export filter configuration')
      console.error(error)
    }
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const shouldImport = window.confirm(
        `Import filter configuration from ${file.name}?\n\nThis will update existing filters with the imported settings.`
      )
      if (!shouldImport) {
        setImportFileInputKey(prev => prev + 1)
        return
      }

      const response = await adminFetch('POST', '/api/admin/filter-config/import', data)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        window.alert(errorData?.message ?? 'Failed to import filter configuration')
        return
      }

      const result = await response.json()
      const updatedCount = result.results.filter((r: any) => r.status === 'updated').length
      const skippedCount = result.results.filter((r: any) => r.status === 'skipped').length
      const errorCount = result.results.filter((r: any) => r.status === 'error').length

      window.alert(
        `Import completed:\n${updatedCount} filters updated\n${skippedCount} filters skipped\n${errorCount} errors`
      )
      refetch()
    } catch (error) {
      window.alert('Failed to parse or import file')
      console.error(error)
    } finally {
      setImportFileInputKey(prev => prev + 1)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filter Configuration
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Short Name (fi)</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterList.map((filter, index) => (
            <TableRow key={filter.id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <IconButton size="small" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ChevronUp />
                </IconButton>
                <IconButton size="small" disabled={index === filterList.length - 1} onClick={() => move(index, 1)}>
                  <ChevronDown />
                </IconButton>
                {filter.displayOrder}
              </TableCell>
              <TableCell>{filter.id}</TableCell>
              <TableCell>{filter.shortName.fi}</TableCell>
              <TableCell>
                <Switch
                  checked={filter.enabled}
                  onChange={() => handleToggleEnabled(filter)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'black' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'black' },
                  }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditTarget(filter)}
                    sx={{ color: 'black', borderColor: 'black' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleRestoreDefaults(filter.id)}
                    disabled={restoringFilterId === filter.id || filtersWithoutSeedDefaults.includes(filter.id)}
                    sx={{ color: 'black', borderColor: 'black' }}
                  >
                    {restoringFilterId === filter.id ? 'Restoring...' : 'Restore'}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {isSuperuser && (
          <Button variant="contained" color="secondary" onClick={() => setEditTarget('new')}>
            + Add filter
          </Button>
        )}
        <BlackOutlinedButton onClick={handleExport}>Export Configuration</BlackOutlinedButton>
        <BlackOutlinedButton component="label">
          Import Configuration
          <input key={importFileInputKey} type="file" accept=".json" hidden onChange={handleImportFile} />
        </BlackOutlinedButton>
      </Box>
      {editTarget !== null && (
        <FilterEditDialog
          filter={editTarget === 'new' ? null : editTarget}
          isSuperuser={isSuperuser}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null)
            refetch()
          }}
        />
      )}
    </Box>
  )
}

export default FilterConfigEditor
