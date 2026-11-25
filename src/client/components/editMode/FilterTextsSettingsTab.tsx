import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterConfig, FilterVariant } from '../../../common/types'
import { hy } from '../common/hy/hyTokens'
import { describeFilterVariant } from './changeVariant'
import FilterTextRow from './FilterTextRow'

type FilterTextsSettingsTabProps = {
  filter: FilterConfig
  variant: FilterVariant | undefined
}

const FilterTextsSettingsTab = ({ filter, variant }: FilterTextsSettingsTabProps) => {
  const { t } = useTranslation()
  const label = variant ? describeFilterVariant(variant, t('v2:filterWordings.choice.default')) : ''

  const tab = (
    <Stack spacing={1.5}>
      <Box
        sx={{
          p: 1.5,
          border: '2px solid',
          borderColor: hy.borderColor.info,
          backgroundColor: hy.bgColor.info,
          borderRadius: '2px',
        }}
      >
        <Typography variant="caption" sx={{ color: hy.textColor.info, fontWeight: 600, display: 'block' }}>
          {t('v2:filterWordings.target.variant')}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{ fontSize: '1.125rem', fontWeight: 700, overflowWrap: 'anywhere' }}
          data-testid="filter-texts-variant"
        >
          {label}
        </Typography>
      </Box>
      <Typography variant="caption">{t('v2:filterSettings.texts.note')}</Typography>
      <FilterTextRow filter={filter} variant={variant} field="variantShortName" />
      <FilterTextRow filter={filter} variant={variant} field="question" />
      <FilterTextRow filter={filter} variant={variant} field="explanation" />
      <FilterTextRow filter={filter} variant={variant} field="variantExtraInfo" />
    </Stack>
  )

  return tab
}

export default FilterTextsSettingsTab
