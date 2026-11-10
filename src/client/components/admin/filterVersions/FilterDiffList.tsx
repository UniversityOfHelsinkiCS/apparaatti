import { Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterPayloadDiff, FilterTextChange, Language } from '../../../../common/types.ts'

const LANGUAGES: Language[] = ['fi', 'sv', 'en']

const ChangeRow = ({ change }: { change: FilterTextChange }) => {
  const { t } = useTranslation()

  const changedLanguages = LANGUAGES.filter(
    language => (change.from?.[language] ?? '') !== (change.to?.[language] ?? '')
  )

  return (
    <Stack spacing={0.5} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
        <Typography variant="subtitle2">{change.filterId}</Typography>
        <Chip size="small" label={t(`v2:filterWordings.field.${change.field}`)} />
        {change.variantName && <Chip size="small" variant="outlined" label={change.variantName} />}
        {change.optionId && <Chip size="small" variant="outlined" label={change.optionId} />}
      </Stack>
      {changedLanguages.map(language => (
        <Typography variant="body2" key={language}>
          <strong>{language}:</strong> {change.from?.[language] || '—'} → {change.to?.[language] || '—'}
        </Typography>
      ))}
    </Stack>
  )
}

const FilterDiffList = ({ diff }: { diff: FilterPayloadDiff | null }) => {
  const { t } = useTranslation()

  if (!diff) {
    return <Typography variant="body2">{t('v2:filterVersions.diff.loading')}</Typography>
  }

  if (diff.addedVariants.length === 0 && diff.changedTexts.length === 0) {
    return <Typography variant="body2">{t('v2:filterVersions.diff.empty')}</Typography>
  }

  return (
    <Stack divider={<span />}>
      {diff.addedVariants.map(added => (
        <Typography variant="body2" key={`${added.filterId}-${added.variantName}`}>
          {t('v2:filterVersions.diff.addedVariant', { filter: added.filterId, variant: added.variantName })}
        </Typography>
      ))}
      {diff.changedTexts.map((change, index) => (
        <ChangeRow
          key={`${change.filterId}-${change.field}-${change.variantName}-${change.optionId}-${index}`}
          change={change}
        />
      ))}
    </Stack>
  )
}

export default FilterDiffList
