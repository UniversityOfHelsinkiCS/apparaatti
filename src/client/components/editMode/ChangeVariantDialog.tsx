import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery, type VariantQuery } from '../../../common/conditionMatching'
import { useFilterContext } from '../../contexts/filterContext'
import ConditionSelectors from '../admin/backendLocaleEdit/ConditionSelectors'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import { normalizeVariantQuery } from './changeVariant'

/** Changes the page answers so the page shows another variant. Mount only while open. */
const ChangeVariantDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  const {
    variantQuery,
    setStudyField,
    setUserOrgCode,
    setLanguage,
    setPrimaryLanguage,
    setPrimaryLanguageSpecification,
  } = useFilterContext()
  const [draft, setDraft] = useState<VariantQuery>(variantQuery)

  const result = normalizeVariantQuery(draft)

  const apply = () => {
    setStudyField(result.organisationCode)
    setUserOrgCode(result.organisationCode)
    setLanguage(result.lang)
    setPrimaryLanguage(result.primaryLanguage)
    setPrimaryLanguageSpecification(result.primaryLanguageSpecification)
    onClose()
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth data-testid="change-variant-dialog">
      <DialogTitle>{t('v2:filterWordings.changeVariant.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="subtitle2">{describeVariantQuery(variantQuery)}</Typography>
            <Typography variant="body2">{t('v2:filterWordings.changeVariant.intro')}</Typography>
          </Alert>

          <Typography variant="subtitle2">{t('v2:filterWordings.changeVariant.conditionsTitle')}</Typography>
          <ConditionSelectors draft={draft} onChange={patch => setDraft(current => ({ ...current, ...patch }))} />

          <Typography variant="body2">
            {t('v2:filterWordings.changeVariant.preview', { variant: describeVariantQuery(result) })}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>{t('v2:filterWordings.changeVariant.cancel')}</BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={apply}>
          {t('v2:filterWordings.changeVariant.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangeVariantDialog
