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
  Typography,
} from '@mui/material'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { organisationCodeToName } from '../../../common/organisations.ts'
import type { RecommendationCode, RecommendationLanguage } from '../../../common/types.ts'
import { translateLocalizedString } from '../../util/i18n.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import { adminFetch } from './filterEdit/filterEditorUtils.ts'
import RecommendationCodeDialog from './recommendationCodeEdit/RecommendationCodeDialog.tsx'

interface RecommendationCodesEditorProps {
  isSuperuser: boolean
}

const RecommendationCodesEditor = ({ isSuperuser }: RecommendationCodesEditorProps) => {
  const { t } = useTranslation()
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

  const languageNameOf = (code: RecommendationCode) => {
    const language = languageList.find(candidate => candidate.id === code.languageId)
    return language ? translateLocalizedString(language.name) : String(code.languageId)
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
        {Object.keys(organisationCodeToName).map(organisationCode => (
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

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label={t('v2:admin.recommendationCodes.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Stack>

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
              {languageFilter === '' && <TableCell>{languageNameOf(code)}</TableCell>}
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
