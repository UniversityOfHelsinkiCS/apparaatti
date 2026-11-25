import { Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { ANY_VARIANT_QUERY, defaultVariant } from '../../../common/conditionMatching'
import type { FilterConfig, FilterVariant, FilterWordingField, LocalizedText } from '../../../common/types'
import { localize } from '../../util/filterConfigAdapter'
import { useEditScope } from './editScope'
import FilterTextEditHandle from './FilterTextEditHandle'

type RowTexts = { current: LocalizedText | undefined; filterText: LocalizedText | undefined }

const textsFor = (filter: FilterConfig, variant: FilterVariant | undefined, field: FilterWordingField): RowTexts => {
  const fallback = defaultVariant(filter.variants)

  if (field === 'variantShortName') {
    const shared = fallback?.shortName ?? filter.shortName
    return { current: variant?.shortName ?? shared, filterText: shared }
  }
  if (field === 'question') {
    return { current: variant?.question, filterText: undefined }
  }
  if (field === 'explanation') {
    const shared = fallback?.explanation ?? filter.explanation
    return { current: variant?.explanation ?? shared, filterText: shared }
  }
  const shared = fallback?.extraInfo ?? filter.extraInfo
  return { current: variant?.extraInfo ?? shared, filterText: shared }
}

type FilterTextRowProps = {
  filter: FilterConfig
  variant: FilterVariant | undefined
  field: FilterWordingField
}

const FilterTextRow = ({ filter, variant, field }: FilterTextRowProps) => {
  const { t, i18n } = useTranslation()
  const scope = useEditScope()
  const { current, filterText } = textsFor(filter, variant, field)
  const label = t(`v2:filterSettings.texts.label.${field}`)
  const preview = current ? localize(current, i18n.resolvedLanguage ?? i18n.language) : ''
  const isOwnText = variant !== undefined && current !== undefined && current !== filterText

  const row = (
    <Paper variant="outlined" sx={{ p: 1.5 }} data-testid={`filter-text-row-${filter.id}-${field}`}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
            {isOwnText ? ` · ${t('v2:filterSettings.texts.ownText')}` : ''}
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {preview || t('v2:filterSettings.texts.empty')}
          </Typography>
        </Stack>
        <FilterTextEditHandle
          filterId={filter.id}
          field={field}
          variantName={variant?.name ?? ''}
          isFallbackVariant={scope?.isFallbackVariant ?? false}
          variantQuery={scope?.variantQuery ?? ANY_VARIANT_QUERY}
          filterVariants={filter.variants}
          current={current}
          filterText={filterText ?? null}
          label={t('v2:filterSettings.texts.edit', { text: label })}
        />
      </Stack>
    </Paper>
  )

  return row
}

export default FilterTextRow
