import { Box, Stack, Typography } from '@mui/material'
import { ClipboardPenLine, Laptop, type LucideIcon, MonitorSmartphone, User, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getDisplayCourseName } from '../../common/nameFormatter'
import type { CourseData } from '../../common/types'
import { getFilterVariant, useFilterContext } from '../contexts/filterContext'
import useBreakpoints from '../hooks/useBreakpoints'
import { translateLocalizedString } from '../util/i18n'
import HyLinkCta from './common/hy/HyLinkCta'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'

const studyPlaceIcons: Record<string, LucideIcon> = {
  online: Laptop,
  contact: Users,
  blended: MonitorSmartphone,
  exam: ClipboardPenLine,
  independent: User,
}

const CourseDateRange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()

  // past courses default, ongoing courses attention, upcoming courses info
  const colour = end < now ? 'default' : start <= now ? 'attention' : 'info'

  const formatDate = (d: Date) => d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
  const text = formatDate(start) + ' - ' + formatDate(end)

  return <HyTag text={text} colour={colour} />
}

const PeriodDisplay = ({ label, periods }: { label: string; periods: string[] }) => {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ color: hy.textColor.secondary }}>
        {label}:
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {periods.map(period => (
          <HyTag key={period} text={period} colour="default" />
        ))}
      </Stack>
    </Stack>
  )
}

const CourseRecommendation = ({ course }: { course: CourseData }) => {
  const { t, i18n } = useTranslation()
  const { isMobile } = useBreakpoints()
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
        border: '1px solid',
        borderColor: hy.borderColor.light,
        backgroundColor: hy.bgColor.white,
      }}
    >
      <Stack useFlexGap spacing={{ xs: 2, sm: 2.25 }} alignItems="flex-start" justifyContent="space-between">
        <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 'h5.fontSize', sm: 'h4.fontSize' } }}>
          {courseTitle}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 0 }} sx={{ width: '100%' }}>
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
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {creditString()} {t('course:credits')}
              </Typography>
              <Typography variant="body2" sx={{ color: hy.textColor.secondary }}>
                {courseCodes}
              </Typography>
            </Stack>
            {periodItems.length > 0 && (
              <PeriodDisplay
                label={t(periodItems.length > 1 ? 'filter:periods' : 'filter:period')}
                periods={periodItems}
              />
            )}
          </Stack>

          <Stack
            direction="column"
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
            sx={{ flexShrink: 0 }}
          >
            <CourseDateRange startDate={course.startDate} endDate={course.endDate} />
            {studyPlaceText && (
              <HyTag text={studyPlaceText} colour="info" prefixIcon={StudyPlaceIcon && <StudyPlaceIcon />} />
            )}
          </Stack>
        </Stack>

        <HyLinkCta
          href={courseUrl}
          target="_blank"
          sx={{ alignSelf: 'flex-start', mt: isMobile ? '4px' : 0 }}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('course:show')}
        </HyLinkCta>
      </Stack>
    </Box>
  )
}

export default CourseRecommendation
