import { Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { ANY_VARIANT_QUERY } from '../../../common/conditionMatching'
import type { FilterConfig, FilterVariant, FilterWordingField, LocalizedText } from '../../../common/types'
import { localize } from '../../util/filterConfigAdapter'
import { useEditScope } from './editScope'
import FilterTextEditHandle from './FilterTextEditHandle'

type RowTexts = { current: LocalizedText | undefined; filterText: LocalizedText | undefined }

const textsFor = (filter: FilterConfig, variant: FilterVariant | undefined, field: FilterWordingField): RowTexts => {
  if (field === 'variantShortName') {
    return { current: variant?.shortName ?? filter.shortName, filterText: filter.shortName }
  }
  if (field === 'question') {
    return { current: variant?.question, filterText: undefined }
  }
  if (field === 'explanation') {
    return { current: variant?.explanation ?? filter.explanation, filterText: filter.explanation }
  }
  return { current: variant?.extraInfo ?? filter.extraInfo, filterText: filter.extraInfo }
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
