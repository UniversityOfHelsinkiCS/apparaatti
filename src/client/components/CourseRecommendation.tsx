import type { SvgIconComponent } from '@mui/icons-material'
import DevicesIcon from '@mui/icons-material/DevicesOutlined'
import LaptopIcon from '@mui/icons-material/LaptopOutlined'
import PeopleIcon from '@mui/icons-material/PeopleOutlined'
import PersonIcon from '@mui/icons-material/PersonOutlined'
import QuizIcon from '@mui/icons-material/QuizOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getDisplayCourseName } from '../../common/nameFormatter'
import type { CourseData } from '../../common/types'
import { getFilterVariant, useFilterContext } from '../contexts/filterContext'
import { translateLocalizedString } from '../util/i18n'
import HyLinkCta from './common/hy/HyLinkCta'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'

const studyPlaceIcons: Record<string, SvgIconComponent> = {
  online: LaptopIcon,
  contact: PeopleIcon,
  blended: DevicesIcon,
  exam: QuizIcon,
  independent: PersonIcon,
}

const PeriodDisplay = ({ label, periods }: { label: string; periods: string[] }) => {
  return (
    <Stack
      direction="row"
      useFlexGap
      flexWrap="wrap"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        mt: 0.25,
        alignSelf: 'flex-start',
        px: 1,
        py: 0.75,
        borderRadius: 2,
        backgroundColor: '#dceaf0',
        border: '1px solid #b7ced8',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: '#52606d',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>

      {periods.map(period => (
        <Box
          key={period}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.25,
            py: 0.625,
            borderRadius: 999,
            backgroundColor: '#ffffff',
            border: '1px solid #aac1cb',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#1f2937',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {period}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

const CourseRecommendation = ({ course }: { course: CourseData }) => {
  const { t, i18n } = useTranslation()
  const filterContext = useFilterContext()
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.id}`
  const courseCodes = course.courseCodes.join(', ')
  const periodVariant = getFilterVariant(filterContext, 'study-period')
  const studyPlaceVariant = getFilterVariant(filterContext, 'study-place')

  const creditString = () => {
    if (!course.credits) {
      return ''
    }
    const maxCredits: number = course.credits.map(c => c['max']).sort((a, b) => b - a)[0]
    const minCredits: number = course.credits.map(c => c['min']).sort()[0]

    if (!maxCredits && !minCredits) {
      return ''
    } else if (!minCredits) {
      return maxCredits.toString()
    } else if (!maxCredits) {
      return minCredits.toString()
    } else if (maxCredits === minCredits) {
      return maxCredits.toString()
    }

    return minCredits + '-' + maxCredits
  }

  const courseDateRange = () => {
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)

    const start = startDate.getDate() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getFullYear()
    const end = endDate.getDate() + '.' + (endDate.getMonth() + 1) + '.' + endDate.getFullYear()

    return start + ' - ' + end
  }

  const prettifyPeriodName = (periodName: string) => {
    const configuredLabel = periodVariant?.options?.find(option => option.id === periodName)?.name
    if (configuredLabel) {
      return configuredLabel
    }

    return periodName.replace(/_/g, ' ')
  }

  const coursePeriodItems = () => {
    const validPeriodIds = new Set(periodVariant?.options?.map(o => o.id) ?? [])
    const periodNames =
      course.period?.map(period => period.name).filter(periodName => validPeriodIds.has(periodName)) ?? []
    return Array.from(new Set(periodNames)).map(prettifyPeriodName)
  }

  const courseStudyPlaceText = () => {
    const normalizedStudyPlace = course.normalizedStudyPlace

    if (!normalizedStudyPlace) {
      return null
    }

    const configuredLabel = studyPlaceVariant?.options?.find(option => option.id === normalizedStudyPlace)?.name

    if (!configuredLabel) {
      return null
    }

    return configuredLabel
  }

  const periodItems = coursePeriodItems()
  const studyPlaceText = courseStudyPlaceText()
  const StudyPlaceIcon = course.normalizedStudyPlace ? studyPlaceIcons[course.normalizedStudyPlace] : null
  const courseTitle =
    getDisplayCourseName(course, i18n.resolvedLanguage ?? i18n.language) ?? translateLocalizedString(course.name)

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 2.5 },
        margin: 1,
        border: '1px solid',
        borderColor: hy.borderColor.light,
        backgroundColor: hy.bgColor.white,
      }}
    >
      <Stack spacing={{ xs: 0.75, sm: 1.5 }} alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: '#0f1720',
            fontWeight: 700,
            lineHeight: 1.25,
            flex: 1,
            fontSize: { xs: '1.2rem', sm: '1.35rem' },
            letterSpacing: '-0.01em',
          }}
        >
          {courseTitle}
        </Typography>

        <Stack direction="row" sx={{ width: '100%' }}>
          <Stack direction={'column'} spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1.5 }}
              useFlexGap
              sx={{
                pt: 0.25,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                {creditString()} {t('course:credits')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                {courseCodes}
              </Typography>
            </Stack>
            {periodItems.length > 0 && <PeriodDisplay label={t('filter:period')} periods={periodItems} />}
          </Stack>

          <Stack direction="column" spacing={1.5} alignItems="flex-end" sx={{ flexShrink: 0 }}>
            <HyTag text={courseDateRange()} colour="info" />
            {studyPlaceText && (
              <HyTag text={studyPlaceText} colour="info" prefixIcon={StudyPlaceIcon && <StudyPlaceIcon />} />
            )}
          </Stack>
        </Stack>
      </Stack>

      <HyLinkCta href={courseUrl} target="_blank">
        {t('course:show')}
      </HyLinkCta>
    </Box>
  )
}

export default CourseRecommendation
