import {
  Box,
  Button,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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

type MatrixSortColumn = 'courseCode' | 'language' | 'coverage' | `faculty:${string}`

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
  const [isNewCodeDialogOpen, setIsNewCodeDialogOpen] = useState(false)
  const [importFileInputKey, setImportFileInputKey] = useState(0)
  const [sortColumn, setSortColumn] = useState<MatrixSortColumn>('language')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  if (isLoading) return <Typography>{t('v2:admin.recommendationCodes.loading')}</Typography>

  const codeList = codes ?? []
  const languageList = languages ?? []
  const allLabel = t('v2:admin.recommendationCodes.allValues')

  const handleSaved = () => {
    refetch()
    refetchLanguages()
  }

  const languageNameOfId = (languageId: number) => {
    const language = languageList.find(candidate => candidate.id === languageId)
    return language ? translateLocalizedString(language.name) : String(languageId)
  }

  const compareMatrixRows = (a: MatrixRow, b: MatrixRow) => {
    if (sortColumn === 'courseCode') return a.courseCode.localeCompare(b.courseCode, 'fi')

    if (sortColumn === 'coverage') {
      const byCoverage = Object.keys(a.idByOrganisation).length - Object.keys(b.idByOrganisation).length
      return byCoverage !== 0 ? byCoverage : a.courseCode.localeCompare(b.courseCode, 'fi')
    }

    if (sortColumn.startsWith('faculty:')) {
      const organisationCode = sortColumn.slice('faculty:'.length)
      const aChecked = a.idByOrganisation[organisationCode] !== undefined ? 1 : 0
      const bChecked = b.idByOrganisation[organisationCode] !== undefined ? 1 : 0
      return aChecked !== bChecked ? bChecked - aChecked : a.courseCode.localeCompare(b.courseCode, 'fi')
    }

    const byLanguage = languageNameOfId(a.languageId).localeCompare(languageNameOfId(b.languageId), 'fi')
    return byLanguage !== 0 ? byLanguage : a.courseCode.localeCompare(b.courseCode, 'fi')
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
      .filter(row => languageFilter === '' || String(row.languageId) === languageFilter)
      .filter(row => organisationFilter === '' || row.idByOrganisation[organisationFilter] !== undefined)
      .sort((a, b) => (sortDirection === 'asc' ? compareMatrixRows(a, b) : compareMatrixRows(b, a)))
  }

  const handleSortClick = (column: MatrixSortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortColumn(column)
    setSortDirection('asc')
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
        <Button variant="contained" color="secondary" startIcon={<Plus />} onClick={() => setIsNewCodeDialogOpen(true)}>
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

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label={t('v2:admin.recommendationCodes.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          select
          size="small"
          sx={{ minWidth: 220 }}
          label={t('v2:admin.recommendationCodes.organisation')}
          value={organisationFilter}
          onChange={e => setOrganisationFilter(e.target.value)}
        >
          <MenuItem value="">{allLabel}</MenuItem>
          {facultyCodes.map(organisationCode => (
            <MenuItem key={organisationCode} value={organisationCode}>
              {organisationCode} — {organisationCodeToName[organisationCode]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          sx={{ minWidth: 220 }}
          label={t('v2:admin.recommendationCodes.language')}
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
        >
          <MenuItem value="">{allLabel}</MenuItem>
          {languageList.map(language => (
            <MenuItem key={language.id} value={String(language.id)}>
              {translateLocalizedString(language.name)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

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
              <TableCell sx={stickyHeaderCell(0)} sortDirection={sortColumn === 'courseCode' && sortDirection}>
                <TableSortLabel
                  active={sortColumn === 'courseCode'}
                  direction={sortColumn === 'courseCode' ? sortDirection : 'asc'}
                  onClick={() => handleSortClick('courseCode')}
                >
                  {t('v2:admin.recommendationCodes.courseCode')}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={stickyHeaderCell(160)} sortDirection={sortColumn === 'language' && sortDirection}>
                <TableSortLabel
                  active={sortColumn === 'language'}
                  direction={sortColumn === 'language' ? sortDirection : 'asc'}
                  onClick={() => handleSortClick('language')}
                >
                  {t('v2:admin.recommendationCodes.language')}
                </TableSortLabel>
              </TableCell>
              {facultyCodes.map(organisationCode => (
                <TableCell
                  key={organisationCode}
                  align="center"
                  sortDirection={sortColumn === `faculty:${organisationCode}` && sortDirection}
                >
                  <Tooltip title={organisationCodeToName[organisationCode]} arrow>
                    <TableSortLabel
                      active={sortColumn === `faculty:${organisationCode}`}
                      direction={sortColumn === `faculty:${organisationCode}` ? sortDirection : 'asc'}
                      onClick={() => handleSortClick(`faculty:${organisationCode}`)}
                    >
                      {organisationCode}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              ))}
              <TableCell align="center" sortDirection={sortColumn === 'coverage' && sortDirection}>
                <TableSortLabel
                  active={sortColumn === 'coverage'}
                  direction={sortColumn === 'coverage' ? sortDirection : 'asc'}
                  onClick={() => handleSortClick('coverage')}
                >
                  {t('v2:admin.recommendationCodes.coverageHeader')}
                </TableSortLabel>
              </TableCell>
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

      {isNewCodeDialogOpen && (
        <RecommendationCodeDialog
          code="new"
          languages={languageList}
          defaultOrganisationCode={organisationFilter}
          defaultLanguageId={languageFilter}
          onClose={() => setIsNewCodeDialogOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}

export default RecommendationCodesEditor
