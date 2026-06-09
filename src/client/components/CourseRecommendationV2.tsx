import type { CourseData, CourseRecommendation as CourseRecommendationType } from '../../common/types'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { translateLocalizedString } from '../util/i18n'
import { useTranslation } from 'react-i18next'
import { getFilterVariant, useFilterContext } from '../contexts/filterContext'

const CourseRecommendationV2 = ({
  course,
}: {
  course: CourseData
}) => {
  const {t} = useTranslation()
  const filterContext = useFilterContext()
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.id}`
  const courseCodes = course.courseCodes.map((code) => code).join(', ')
  const periodVariant = getFilterVariant(filterContext, 'study-period')
  const studyPlaceVariant = getFilterVariant(filterContext, 'study-place')
  const badgeStyles = {
    color: '#334155',
    fontWeight: 600,
    px: 1.25,
    py: 0.5,
    borderRadius: 1,
    backgroundColor: '#e8edf2',
    border: '1px solid #d5dde5',
    whiteSpace: 'nowrap',
  }

  const creditString:() => string = () => {
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
  const courseDateRange = (course: CourseData) => {
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)

    const start =
      startDate.getDate() +
      '.' +
      (startDate.getMonth() + 1) +
      '.' +
      startDate.getFullYear()
    const end =
      endDate.getDate() +
      '.' +
      (endDate.getMonth() + 1) +
      '.' +
      endDate.getFullYear()

    return start + ' - ' + end
  }

  const prettifyPeriodName = (periodName: string) => {
    const configuredLabel = periodVariant?.options?.find((option) => option.id === periodName)?.name
    if (configuredLabel) {
      return configuredLabel
    }

    const regularPeriodMatch = periodName.match(/^period_(\d+)$/)
    if (regularPeriodMatch) {
      return `${regularPeriodMatch[1]}. ${t('course:periodName')}`
    }

    const examWeekMatch = periodName.match(/^exam_week_(\d+)$/)
    if (examWeekMatch) {
      return `${t('course:examWeek')} ${examWeekMatch[1]}`
    }

    const intensivePeriodMatch = periodName.match(/^intensive_(\d+)(?:_previous)?$/)
    if (intensivePeriodMatch) {
      return `${t('course:intensivePeriod')} ${intensivePeriodMatch[1]}`
    }

    return periodName.replace(/_/g, ' ')
  }

  const coursePeriodText = () => {
    const periodNames =
      course.period
        ?.map((period) => period.name)
        .filter((periodName) => !/^exam_week_\d+$/.test(periodName)) ?? []
    const uniquePeriodNames = Array.from(new Set(periodNames))

    if (uniquePeriodNames.length === 0) {
      return null
    }

    return uniquePeriodNames
      .map((periodName) => prettifyPeriodName(periodName))
      .join(', ')
  }

  const courseStudyPlaceText = () => {
    const normalizedStudyPlace = course.normalizedStudyPlace

    if (!normalizedStudyPlace) {
      return null
    }

    const configuredLabel = studyPlaceVariant?.options?.find((option) => option.id === normalizedStudyPlace)?.name

    if (!configuredLabel) {
      return null
    }

    return configuredLabel
  }

  const periodText = coursePeriodText()
  const studyPlaceText = courseStudyPlaceText()

  if (!course) return null
  return (
    <Paper
      elevation={0}
      sx={{
        padding: { xs: 2, sm: 2.5 },
        margin: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: '#d6dbe1',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.75, sm: 1.5 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ color: '#17212b', fontWeight: 600, lineHeight: 1.3, flex: 1 }}
          >
            {translateLocalizedString(course.name)}
          </Typography>
          <Typography
            variant="body2"
            sx={badgeStyles}
          >
            {courseDateRange(course)}
          </Typography>
        </Stack>
        <Stack direction={'column'} spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 1.5 }}
            sx={{
              pt: 0.25,
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1.5 }}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#334155', fontWeight: 500 }}
              >
                {creditString()} {t('course:credits')}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#475569' }}
              >
                {courseCodes}
              </Typography>
            </Stack>
            {studyPlaceText && (
              <Typography
                variant="body2"
                sx={badgeStyles}
              >
                {studyPlaceText}
              </Typography>
            )}
          </Stack>
          {periodText && (
            <Typography
              variant="body2"
              sx={{
                color: '#1f2937',
                fontWeight: 600,
                pt: 0.25,
              }}
            >
              {t('filter:period')}: {periodText}
            </Typography>
          )}
        </Stack>
        
        <Button
          variant="contained"
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            marginTop: 1.5,
            backgroundColor: '#cfd4da',
            color: '#1f2933',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#bfc6cd',
              boxShadow: 'none',
            },
          }}
        >
          {t('course:show')}
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseRecommendationV2
