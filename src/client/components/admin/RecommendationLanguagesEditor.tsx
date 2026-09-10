import { Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { RecommendationCode, RecommendationLanguage } from '../../../common/types.ts'
import { translateLocalizedString } from '../../util/i18n.ts'
import useApi from '../../util/useApi.tsx'
import { adminFetch } from './filterEdit/filterEditorUtils.ts'
import RecommendationLanguageDialog from './recommendationCodeEdit/RecommendationLanguageDialog.tsx'

const RecommendationLanguagesEditor = () => {
  const { t } = useTranslation()
  const {
    data: languages,
    isLoading,
    refetch,
  } = useApi<RecommendationLanguage[]>('admin-recommendation-languages', '/api/admin/recommendation-languages', 'GET')
  const { data: codes, refetch: refetchCodes } = useApi<RecommendationCode[]>(
    'admin-recommendation-codes',
    '/api/admin/recommendation-codes',
    'GET'
  )
  const [dialogTarget, setDialogTarget] = useState<RecommendationLanguage | 'new' | null>(null)

  if (isLoading) return <Typography>{t('v2:admin.recommendationCodes.loading')}</Typography>

  const languageList = languages ?? []
  const codeList = codes ?? []
  const anyLabel = t('v2:admin.recommendationCodes.anyValue')

  const handleSaved = () => {
    refetch()
    refetchCodes()
  }

  const codeCountOf = (language: RecommendationLanguage) =>
    codeList.filter(code => code.languageId === language.id).length

  const handleDelete = async (language: RecommendationLanguage) => {
    const confirmed = window.confirm(
      t('v2:admin.recommendationCodes.confirmDeleteLanguage', {
        name: translateLocalizedString(language.name),
      })
    )
    if (!confirmed) return

    const response = await adminFetch('DELETE', `/api/admin/recommendation-languages/${language.id}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      window.alert(errorData?.message ?? t('v2:admin.recommendationCodes.saveFailed'))
      return
    }

    handleSaved()
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('v2:admin.recommendationCodes.languagesTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('v2:admin.recommendationCodes.languagesIntro')}
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<Plus />}
        sx={{ mb: 2 }}
        onClick={() => setDialogTarget('new')}
      >
        {t('v2:admin.recommendationCodes.newLanguage')}
      </Button>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('v2:admin.recommendationCodes.languageName')}</TableCell>
            <TableCell>{t('v2:admin.recommendationCodes.lang')}</TableCell>
            <TableCell>{t('v2:admin.recommendationCodes.languageType')}</TableCell>
            <TableCell>{t('v2:admin.recommendationCodes.specification')}</TableCell>
            <TableCell>{t('v2:admin.recommendationCodes.table.codeCount')}</TableCell>
            <TableCell>{t('v2:admin.recommendationCodes.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {languageList.map(language => (
            <TableRow key={language.id}>
              <TableCell>{translateLocalizedString(language.name)}</TableCell>
              <TableCell>{t(`v2:admin.recommendationCodes.langOption.${language.lang}`)}</TableCell>
              <TableCell>
                {language.languageType === null
                  ? anyLabel
                  : t(`v2:admin.recommendationCodes.languageTypeOption.${language.languageType}`)}
              </TableCell>
              <TableCell>
                {language.primaryLanguageSpecification === null
                  ? anyLabel
                  : t(`v2:admin.recommendationCodes.specificationOption.${language.primaryLanguageSpecification}`)}
              </TableCell>
              <TableCell>{codeCountOf(language)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <IconButton
                  size="small"
                  aria-label={t('v2:admin.recommendationCodes.editLanguage')}
                  onClick={() => setDialogTarget(language)}
                >
                  <Pencil />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={t('v2:admin.recommendationCodes.deleteLanguage')}
                  onClick={() => handleDelete(language)}
                >
                  <Trash2 />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dialogTarget && (
        <RecommendationLanguageDialog
          language={dialogTarget}
          onClose={() => setDialogTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}

export default RecommendationLanguagesEditor
