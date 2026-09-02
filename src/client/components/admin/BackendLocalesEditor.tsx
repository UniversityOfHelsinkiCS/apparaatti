import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BackendLocaleKey, BackendLocaleValue } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import BackendLocaleKeyDialog from './backendLocaleEdit/BackendLocaleKeyDialog.tsx'
import { hasCatchAllValue } from './backendLocaleEdit/backendLocaleUtils.ts'
import BackendLocaleValueDialog from './backendLocaleEdit/BackendLocaleValueDialog.tsx'
import { adminFetch } from './filterEdit/filterEditorUtils.ts'

interface BackendLocalesEditorProps {
  isSuperuser: boolean
}

const BackendLocalesEditor = ({ isSuperuser }: BackendLocalesEditorProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    data: keys,
    isLoading,
    refetch,
  } = useApi<BackendLocaleKey[]>('admin-backend-locales', '/api/admin/backend-locales', 'GET')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [keyDialogTarget, setKeyDialogTarget] = useState<BackendLocaleKey | 'new' | null>(null)
  const [valueDialogTarget, setValueDialogTarget] = useState<{
    localeKey: BackendLocaleKey
    value: BackendLocaleValue | 'new'
  } | null>(null)
  const [importFileInputKey, setImportFileInputKey] = useState<number>(0)

  if (isLoading) return <Typography>{t('v2:admin.backendLocales.loading')}</Typography>

  const keyList: BackendLocaleKey[] = keys ?? []

  const handleSaved = () => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['backendLocales'] })
  }

  const conditionLabel = (condition: string | null) => condition ?? t('v2:admin.backendLocales.anyValue')

  const handleDeleteKey = async (localeKey: BackendLocaleKey) => {
    const confirmed = window.confirm(
      t('v2:admin.backendLocales.confirmDeleteKey', { key: localeKey.key, count: localeKey.values.length })
    )
    if (!confirmed) return

    await adminFetch('DELETE', `/api/admin/backend-locales/${encodeURIComponent(localeKey.key)}`)
    handleSaved()
  }

  const handleDeleteValue = async (value: BackendLocaleValue) => {
    const confirmed = window.confirm(t('v2:admin.backendLocales.confirmDeleteValue'))
    if (!confirmed) return

    await adminFetch('DELETE', `/api/admin/backend-locales/values/${value.id}`)
    handleSaved()
  }

  const handleExport = async () => {
    const response = await adminFetch('GET', '/api/admin/backend-locales/export')
    if (!response.ok) {
      window.alert(t('v2:admin.backendLocales.exportFailed'))
      return
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backend-locales-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = JSON.parse(await file.text())

      const shouldImport = window.confirm(t('v2:admin.backendLocales.importConfirm', { fileName: file.name }))
      if (!shouldImport) return

      const response = await adminFetch('POST', '/api/admin/backend-locales/import', data)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        window.alert(errorData?.message ?? t('v2:admin.backendLocales.importFailed'))
        return
      }

      const result = await response.json()
      window.alert(t('v2:admin.backendLocales.importCompleted', { count: result.results.length }))
      handleSaved()
    } catch (error) {
      window.alert(t('v2:admin.backendLocales.parseFailed'))
      console.error(error)
    } finally {
      setImportFileInputKey(previous => previous + 1)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('v2:admin.backendLocales.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('v2:admin.backendLocales.intro')}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="contained" color="secondary" startIcon={<Plus />} onClick={() => setKeyDialogTarget('new')}>
          {t('v2:admin.backendLocales.newKey')}
        </Button>
        {isSuperuser && (
          <>
            <BlackOutlinedButton onClick={handleExport}>{t('v2:admin.backendLocales.export')}</BlackOutlinedButton>
            <BlackOutlinedButton component="label">
              {t('v2:admin.backendLocales.import')}
              <input key={importFileInputKey} type="file" accept=".json" hidden onChange={handleImportFile} />
            </BlackOutlinedButton>
          </>
        )}
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>{t('v2:admin.backendLocales.table.key')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.table.description')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.table.textCount')}</TableCell>
            <TableCell>{t('v2:admin.backendLocales.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keyList.map(localeKey => (
            <Fragment key={localeKey.key}>
              <TableRow>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label={t('v2:admin.backendLocales.toggleTexts', { key: localeKey.key })}
                    onClick={() => setExpandedKey(current => (current === localeKey.key ? null : localeKey.key))}
                  >
                    {expandedKey === localeKey.key ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                </TableCell>
                <TableCell>{localeKey.key}</TableCell>
                <TableCell>
                  <Typography variant="body2">{localeKey.description}</Typography>
                  {!hasCatchAllValue(localeKey) && (
                    <Chip
                      size="small"
                      sx={{ mt: 0.5, backgroundColor: '#fff4e5', color: '#663c00' }}
                      label={t('v2:admin.backendLocales.noCatchAll')}
                    />
                  )}
                </TableCell>
                <TableCell>{localeKey.values.length}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton
                    size="small"
                    aria-label={t('v2:admin.backendLocales.editKey')}
                    onClick={() => setKeyDialogTarget(localeKey)}
                  >
                    <Pencil />
                  </IconButton>
                  {isSuperuser && (
                    <IconButton
                      size="small"
                      aria-label={t('v2:admin.backendLocales.deleteKey')}
                      onClick={() => handleDeleteKey(localeKey)}
                    >
                      <Trash2 />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>

              {expandedKey === localeKey.key && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('v2:admin.backendLocales.organisation')}</TableCell>
                          <TableCell>{t('v2:admin.backendLocales.lang')}</TableCell>
                          <TableCell>{t('v2:admin.backendLocales.primaryLanguage')}</TableCell>
                          <TableCell>{t('v2:admin.backendLocales.specification')}</TableCell>
                          <TableCell>{t('v2:admin.backendLocales.table.textFi')}</TableCell>
                          <TableCell>{t('v2:admin.backendLocales.table.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {localeKey.values.map(value => (
                          <TableRow key={value.id}>
                            <TableCell>{conditionLabel(value.organisationCode)}</TableCell>
                            <TableCell>{conditionLabel(value.lang)}</TableCell>
                            <TableCell>{conditionLabel(value.primaryLanguage)}</TableCell>
                            <TableCell>{conditionLabel(value.primaryLanguageSpecification)}</TableCell>
                            <TableCell>{value.text.fi.slice(0, 80)}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <IconButton
                                size="small"
                                aria-label={t('v2:admin.backendLocales.editText')}
                                onClick={() => setValueDialogTarget({ localeKey, value })}
                              >
                                <Pencil />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label={t('v2:admin.backendLocales.deleteText')}
                                onClick={() => handleDeleteValue(value)}
                              >
                                <Trash2 />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button
                      size="small"
                      startIcon={<Plus />}
                      sx={{ mt: 1, color: 'black' }}
                      onClick={() => setValueDialogTarget({ localeKey, value: 'new' })}
                    >
                      {t('v2:admin.backendLocales.newText')}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      {keyDialogTarget && (
        <BackendLocaleKeyDialog
          localeKey={keyDialogTarget}
          onClose={() => setKeyDialogTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {valueDialogTarget && (
        <BackendLocaleValueDialog
          localeKey={valueDialogTarget.localeKey}
          value={valueDialogTarget.value}
          onClose={() => setValueDialogTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}

export default BackendLocalesEditor
