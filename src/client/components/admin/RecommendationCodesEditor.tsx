import {
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { organisationCodeToName } from '../../../common/organisations.ts'
import type { RecommendationCode, RecommendationLanguage } from '../../../common/types.ts'
import { translateLocalizedString } from '../../util/i18n.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import HyCheckbox from '../common/hy/HyCheckbox.tsx'
import { adminFetch } from './filterEdit/filterEditorUtils.ts'
import RecommendationCodeDialog from './recommendationCodeEdit/RecommendationCodeDialog.tsx'

interface RecommendationCodesEditorProps {
  isSuperuser: boolean
}

type MatrixRow = {
  courseCode: string
  languageId: number
  idByOrganisation: Record<string, number>
}

const facultyCodes = Object.keys(organisationCodeToName).sort((a, b) =>
  organisationCodeToName[a].localeCompare(organisationCodeToName[b], 'fi')
)

const stickyCell = (left: number) => ({
  position: 'sticky' as const,
  left,
  zIndex: 1,
  backgroundColor: 'background.paper',
  whiteSpace: 'nowrap' as const,
  minWidth: 160,
})

const stickyHeaderCell = (left: number) => ({
  ...stickyCell(left),
  top: 0,
  zIndex: 3,
})

const RecommendationCodesEditor = ({ isSuperuser }: RecommendationCodesEditorProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    data: codes,
    isLoading,
    refetch,
  } = useApi<RecommendationCode[]>('admin-recommendation-codes', '/api/admin/recommendation-codes', 'GET')
  const { data: languages, refetch: refetchLanguages } = useApi<RecommendationLanguage[]>(
    'admin-recommendation-languages',
    '/api/admin/recommendation-languages',
    'GET'
  )
  const [organisationFilter, setOrganisationFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dialogTarget, setDialogTarget] = useState<RecommendationCode | 'new' | null>(null)
  const [importFileInputKey, setImportFileInputKey] = useState(0)
  const [viewMode, setViewMode] = useState<'rows' | 'matrix'>('rows')

  if (isLoading) return <Typography>{t('v2:admin.recommendationCodes.loading')}</Typography>

  const codeList = codes ?? []
  const languageList = languages ?? []
  const allLabel = t('v2:admin.recommendationCodes.allValues')

  const handleSaved = () => {
    refetch()
    refetchLanguages()
  }

  const codeCountOf = (organisationCode: string) =>
    codeList.filter(code => code.organisationCode === organisationCode).length

  const languageCountOf = (languageId: number) =>
    codeList
      .filter(code => organisationFilter === '' || code.organisationCode === organisationFilter)
      .filter(code => code.languageId === languageId).length

  const languageNameOfId = (languageId: number) => {
    const language = languageList.find(candidate => candidate.id === languageId)
    return language ? translateLocalizedString(language.name) : String(languageId)
  }

  const matrixRows = (): MatrixRow[] => {
    const byKey: Record<string, MatrixRow> = {}

    for (const code of codeList) {
      const key = `${code.courseCode}@@${code.languageId}`
      if (!byKey[key]) {
        byKey[key] = { courseCode: code.courseCode, languageId: code.languageId, idByOrganisation: {} }
      }
      byKey[key].idByOrganisation[code.organisationCode] = code.id
    }

    return Object.values(byKey)
      .filter(row => search === '' || row.courseCode.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const byLanguage = languageNameOfId(a.languageId).localeCompare(languageNameOfId(b.languageId), 'fi')
        return byLanguage !== 0 ? byLanguage : a.courseCode.localeCompare(b.courseCode)
      })
  }

  const setCachedCodes = (update: (current: RecommendationCode[]) => RecommendationCode[]) =>
    queryClient.setQueryData<RecommendationCode[]>(['admin-recommendation-codes'], current => update(current ?? []))

  const handleToggleCell = async (row: MatrixRow, organisationCode: string) => {
    const existingId = row.idByOrganisation[organisationCode]

    if (existingId !== undefined) {
      setCachedCodes(current => current.filter(code => code.id !== existingId))
      const response = await adminFetch('DELETE', `/api/admin/recommendation-codes/${existingId}`)
      if (!response.ok) {
        window.alert(t('v2:admin.recommendationCodes.saveFailed'))
        refetch()
      }
      return
    }

    const payload = { organisationCode, languageId: row.languageId, courseCode: row.courseCode }
    const response = await adminFetch('POST', '/api/admin/recommendation-codes', payload)
    if (!response.ok) {
      window.alert(t('v2:admin.recommendationCodes.saveFailed'))
      refetch()
      return
    }

    const created = await response.json()
    setCachedCodes(current => [...current, created])
  }

  const visibleCodes = codeList
    .filter(code => organisationFilter === '' || code.organisationCode === organisationFilter)
    .filter(code => languageFilter === '' || String(code.languageId) === languageFilter)
    .filter(code => search === '' || code.courseCode.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (code: RecommendationCode) => {
    const confirmed = window.confirm(
      t('v2:admin.recommendationCodes.confirmDeleteCode', { courseCode: code.courseCode })
    )
    if (!confirmed) return

    await adminFetch('DELETE', `/api/admin/recommendation-codes/${code.id}`)
    handleSaved()
  }

  const handleExport = async () => {
    const response = await adminFetch('GET', '/api/admin/recommendation-codes/export')
    if (!response.ok) {
      window.alert(t('v2:admin.recommendationCodes.exportFailed'))
      return
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `recommendation-codes-${new Date().toISOString().split('T')[0]}.json`
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

      const shouldImport = window.confirm(t('v2:admin.recommendationCodes.importConfirm', { fileName: file.name }))
      if (!shouldImport) return

      const response = await adminFetch('POST', '/api/admin/recommendation-codes/import', data)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        window.alert(errorData?.message ?? t('v2:admin.recommendationCodes.importFailed'))
        return
      }

      const result = await response.json()
      window.alert(t('v2:admin.recommendationCodes.importCompleted', { count: result.results.codes }))
      handleSaved()
    } catch (error) {
      window.alert(t('v2:admin.recommendationCodes.parseFailed'))
      console.error(error)
    } finally {
      setImportFileInputKey(previous => previous + 1)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('v2:admin.recommendationCodes.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('v2:admin.recommendationCodes.intro')}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, value) => value && setViewMode(value as 'rows' | 'matrix')}
          aria-label={t('v2:admin.recommendationCodes.viewMode')}
        >
          <ToggleButton value="rows">{t('v2:admin.recommendationCodes.viewRows')}</ToggleButton>
          <ToggleButton value="matrix">{t('v2:admin.recommendationCodes.viewMatrix')}</ToggleButton>
        </ToggleButtonGroup>

        <Button variant="contained" color="secondary" startIcon={<Plus />} onClick={() => setDialogTarget('new')}>
          {t('v2:admin.recommendationCodes.newCode')}
        </Button>
        {isSuperuser && (
          <>
            <BlackOutlinedButton onClick={handleExport}>{t('v2:admin.recommendationCodes.export')}</BlackOutlinedButton>
            <BlackOutlinedButton component="label">
              {t('v2:admin.recommendationCodes.import')}
              <input key={importFileInputKey} type="file" accept=".json" hidden onChange={handleImportFile} />
            </BlackOutlinedButton>
          </>
        )}
      </Stack>

      {viewMode === 'rows' && (
        <>
          <Tabs
            value={organisationFilter}
            onChange={(_, value) => setOrganisationFilter(value as string)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={t('v2:admin.recommendationCodes.organisation')}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
            textColor="inherit"
          >
            <Tab value="" label={allLabel} />
            {facultyCodes.map(organisationCode => (
              <Tab
                key={organisationCode}
                value={organisationCode}
                label={`${organisationCodeToName[organisationCode]} (${codeCountOf(organisationCode)})`}
              />
            ))}
          </Tabs>

          <Tabs
            value={languageFilter}
            onChange={(_, value) => setLanguageFilter(value as string)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={t('v2:admin.recommendationCodes.language')}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
            textColor="inherit"
          >
            <Tab value="" label={allLabel} />
            {languageList.map(language => (
              <Tab
                key={language.id}
                value={String(language.id)}
                label={`${translateLocalizedString(language.name)} (${languageCountOf(language.id)})`}
              />
            ))}
          </Tabs>
        </>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label={t('v2:admin.recommendationCodes.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Stack>

      {viewMode === 'rows' && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('v2:admin.recommendationCodes.showing', { shown: visibleCodes.length, total: codeList.length })}
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                {organisationFilter === '' && <TableCell>{t('v2:admin.recommendationCodes.organisation')}</TableCell>}
                {languageFilter === '' && <TableCell>{t('v2:admin.recommendationCodes.language')}</TableCell>}
                <TableCell>{t('v2:admin.recommendationCodes.courseCode')}</TableCell>
                <TableCell>{t('v2:admin.recommendationCodes.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleCodes.map(code => (
                <TableRow key={code.id}>
                  {organisationFilter === '' && (
                    <TableCell>
                      {code.organisationCode} — {organisationCodeToName[code.organisationCode]}
                    </TableCell>
                  )}
                  {languageFilter === '' && <TableCell>{languageNameOfId(code.languageId)}</TableCell>}
                  <TableCell>{code.courseCode}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      aria-label={t('v2:admin.recommendationCodes.editCode')}
                      onClick={() => setDialogTarget(code)}
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={t('v2:admin.recommendationCodes.deleteCode')}
                      onClick={() => handleDelete(code)}
                    >
                      <Trash2 />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {viewMode === 'matrix' && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('v2:admin.recommendationCodes.matrixIntro')}
          </Typography>

          <Box
            sx={{
              overflow: 'auto',
              maxHeight: 'calc(100vh - 400px)',
              minHeight: 240,
              backgroundColor: 'background.paper',
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{ width: 'auto', '& .MuiTableCell-stickyHeader': { backgroundColor: 'background.paper' } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={stickyHeaderCell(0)}>{t('v2:admin.recommendationCodes.courseCode')}</TableCell>
                  <TableCell sx={stickyHeaderCell(160)}>{t('v2:admin.recommendationCodes.language')}</TableCell>
                  {facultyCodes.map(organisationCode => (
                    <TableCell key={organisationCode} align="center" title={organisationCodeToName[organisationCode]}>
                      {organisationCode}
                    </TableCell>
                  ))}
                  <TableCell align="center">{t('v2:admin.recommendationCodes.coverageHeader')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matrixRows().map(row => (
                  <TableRow key={`${row.courseCode}@@${row.languageId}`} hover>
                    <TableCell sx={stickyCell(0)}>{row.courseCode}</TableCell>
                    <TableCell sx={stickyCell(160)}>{languageNameOfId(row.languageId)}</TableCell>
                    {facultyCodes.map(organisationCode => (
                      <TableCell key={organisationCode} align="center" padding="none">
                        <HyCheckbox
                          black
                          sx={{ p: 0.5 }}
                          checked={row.idByOrganisation[organisationCode] !== undefined}
                          onChange={() => handleToggleCell(row, organisationCode)}
                          inputProps={{
                            'aria-label': t('v2:admin.recommendationCodes.toggleCell', {
                              courseCode: row.courseCode,
                              faculty: organisationCodeToName[organisationCode],
                            }),
                          }}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      {t('v2:admin.recommendationCodes.coverage', {
                        count: Object.keys(row.idByOrganisation).length,
                        total: facultyCodes.length,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      {dialogTarget && (
        <RecommendationCodeDialog
          code={dialogTarget}
          languages={languageList}
          defaultOrganisationCode={organisationFilter}
          defaultLanguageId={languageFilter}
          onClose={() => setDialogTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}

export default RecommendationCodesEditor
