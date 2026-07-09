import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getUnansweredCurrentMandatoryFilters, useFilterContext } from '../contexts/filterContext'
import useBreakpoints from '../hooks/useBreakpoints'
import AppMarkdown from './common/AppMarkdown'
import HyButton from './common/hy/HyButton'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'
import ResetFiltersButton from './ResetFiltersButton'

type UnansweredPromptProps = {
  filters: { id: string; shortName?: string }[]
  onOpenFilters: () => void
}

const UnansweredPrompt = ({ filters, onOpenFilters }: UnansweredPromptProps) => {
  const { t } = useTranslation()
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 600 }}>
        {t('v2:noRecommendations.unansweredMandatory')}:
      </Typography>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={0.75}>
        {filters.map(filter => (
          <HyTag
            key={filter.id}
            text={filter.shortName ?? filter.id}
            colour="attention"
            onClick={onOpenFilters}
            ariaLabel={t('v2:openFilters')}
          />
        ))}
      </Stack>
    </Box>
  )
}

type NoRecommendationsInfoProps = {
  onOpenFilters: () => void
}

const NoRecommendationsInfo = ({ onOpenFilters }: NoRecommendationsInfoProps) => {
  const { t, i18n } = useTranslation()
  const { isDrawerLayout } = useBreakpoints()
  const filterContext = useFilterContext()
  const { studyField, filters } = filterContext

  const additionalInfoKey = `v2:noRecommendations.additional-info-no-recommendations-md-${studyField}`
  const additionalInfo = i18n.exists(additionalInfoKey) ? t(additionalInfoKey) : null

  const mandatoryFilters = getUnansweredCurrentMandatoryFilters(filters, filterContext)

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: hy.borderColor.light,
        backgroundColor: hy.bgColor.white,
      }}
    >
      <Stack spacing={{ xs: 2, sm: 2.25 }} alignItems="flex-start">
        <Typography variant="h3" component="h2" sx={{ fontSize: { xs: 'h4.fontSize', sm: 'h3.fontSize' } }}>
          {t('v2:noRecommendations.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: hy.textColor.secondary }}>
          {t('v2:noRecommendations.description')}
        </Typography>
        {mandatoryFilters.length > 0 ? (
          <UnansweredPrompt filters={mandatoryFilters} onOpenFilters={onOpenFilters} />
        ) : (
          <>
            {additionalInfo && <AppMarkdown>{additionalInfo}</AppMarkdown>}
            <Stack direction="column" spacing={'8px'} flexWrap="wrap">
              {isDrawerLayout && (
                <HyButton variant="primary" colour="blue" onClick={onOpenFilters}>
                  {t('v2:noRecommendations.changeSelectionsButton')}
                </HyButton>
              )}
              <ResetFiltersButton onReset={onOpenFilters} />
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  )
}

export default NoRecommendationsInfo
