import { Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterPayloadDiff, FilterSettingChange, FilterTextChange, Language } from '../../../../common/types.ts'

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

const SettingRow = ({ change }: { change: FilterSettingChange }) => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ py: 1 }}>
      <Typography variant="subtitle2">{change.filterId}</Typography>
      <Chip size="small" label={t(`v2:filterSettings.field.${change.field}`, { defaultValue: change.field })} />
      {change.variantName && <Chip size="small" variant="outlined" label={change.variantName} />}
      {change.optionId && <Chip size="small" variant="outlined" label={change.optionId} />}
      <Typography variant="body2">
        {change.from ?? '—'} → {change.to ?? '—'}
      </Typography>
    </Stack>
  )
}

const FilterDiffList = ({ diff }: { diff: FilterPayloadDiff | null }) => {
  const { t } = useTranslation()

  if (!diff) {
    return <Typography variant="body2">{t('v2:filterVersions.diff.loading')}</Typography>
  }

  const isEmpty =
    diff.addedVariants.length === 0 &&
    diff.removedVariants.length === 0 &&
    diff.addedOptions.length === 0 &&
    diff.removedOptions.length === 0 &&
    diff.changedTexts.length === 0 &&
    diff.changedSettings.length === 0

  if (isEmpty) {
    return <Typography variant="body2">{t('v2:filterVersions.diff.empty')}</Typography>
  }

  return (
    <Stack divider={<span />}>
      {diff.addedVariants.map(added => (
        <Typography variant="body2" key={`${added.filterId}-${added.variantName}`}>
          {t('v2:filterVersions.diff.addedVariant', { filter: added.filterId, variant: added.variantName })}
        </Typography>
      ))}
      {diff.removedVariants.map(removed => (
        <Typography variant="body2" key={`removed-${removed.filterId}-${removed.variantName}`}>
          {t('v2:filterVersions.diff.removedVariant', { filter: removed.filterId, variant: removed.variantName })}
        </Typography>
      ))}
      {diff.addedOptions.map(added => (
        <Typography variant="body2" key={`added-${added.filterId}-${added.variantName}-${added.optionId}`}>
          {t('v2:filterVersions.diff.addedOption', {
            filter: added.filterId,
            variant: added.variantName,
            option: added.optionId,
          })}
        </Typography>
      ))}
      {diff.removedOptions.map(removed => (
        <Typography variant="body2" key={`removed-${removed.filterId}-${removed.variantName}-${removed.optionId}`}>
          {t('v2:filterVersions.diff.removedOption', {
            filter: removed.filterId,
            variant: removed.variantName,
            option: removed.optionId,
          })}
        </Typography>
      ))}
      {diff.changedTexts.map((change, index) => (
        <ChangeRow
          key={`${change.filterId}-${change.field}-${change.variantName}-${change.optionId}-${index}`}
          change={change}
        />
      ))}
      {diff.changedSettings.map((change, index) => (
        <SettingRow key={`${change.filterId}-${change.field}-${change.optionId}-${index}`} change={change} />
      ))}
    </Stack>
  )
}

export default FilterDiffList
