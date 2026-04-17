import { useState } from 'react'
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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import useApi from '../../util/useApi.tsx'
import type { FilterConfig } from '../../../common/types.ts'
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
  const { data: filters, isLoading, refetch } = useApi(
    'admin-filter-config',
    '/api/admin/filter-config',
    'GET',
    null
  )
  const [editTarget, setEditTarget] = useState<FilterConfig | 'new' | null>(null)

  if (isLoading) return <Typography>Loading filters...</Typography>

  const filterList: FilterConfig[] = filters ?? []

  const handleToggleEnabled = async (filter: FilterConfig) => {
    if (filter.enabled) {
      await adminFetch('DELETE', `/api/admin/filter-config/${filter.id}`)
    } else {
      await adminFetch('PUT', `/api/admin/filter-config/${filter.id}`, {
        ...filter,
        enabled: true,
      })
    }
    refetch()
  }

  const handleToggleStrictByDefault = async (filter: FilterConfig) => {
    await adminFetch('PUT', `/api/admin/filter-config/${filter.id}`, {
      ...filter,
      isStrictByDefault: !filter.isStrictByDefault,
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

    const response = await adminFetch('POST', `/api/admin/filter-config/${filterId}/restore`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      window.alert(errorData?.message ?? 'Failed to restore filter defaults')
      return
    }

    refetch()
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
            <TableCell>Strict by default</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterList.map((filter, index) => (
            <TableRow key={filter.id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === filterList.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
                {filter.displayOrder}
              </TableCell>
              <TableCell>{filter.id}</TableCell>
              <TableCell>{filter.shortName.fi}</TableCell>
              <TableCell>
                <Switch
                  checked={filter.isStrictByDefault}
                  onChange={() => handleToggleStrictByDefault(filter)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'black' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'black' },
                  }}
                />
              </TableCell>
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
                    sx={{ color: 'black', borderColor: 'black' }}
                  >
                    Restore
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ mt: 2 }}>
        {isSuperuser && (
          <Button variant="contained" color="secondary" onClick={() => setEditTarget('new')}>
            + Add filter
          </Button>
        )}
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
