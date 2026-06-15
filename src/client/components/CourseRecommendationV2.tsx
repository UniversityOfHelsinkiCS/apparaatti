import type { CourseData } from '../../common/types'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import LaptopIcon from '@mui/icons-material/LaptopOutlined'
import PeopleIcon from '@mui/icons-material/PeopleOutlined'
import DevicesIcon from '@mui/icons-material/DevicesOutlined'
import QuizIcon from '@mui/icons-material/QuizOutlined'
import PersonIcon from '@mui/icons-material/PersonOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { translateLocalizedString } from '../util/i18n'
import { useTranslation } from 'react-i18next'
import { getFilterVariant, useFilterContext } from '../contexts/filterContext'
import { getDisplayCourseName } from '../../common/nameFormatter'

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

const CourseRecommendationV2 = ({ course }: { course: CourseData }) => {
  const { t, i18n } = useTranslation()
  const filterContext = useFilterContext()
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.id}`
  const courseCodes = course.courseCodes.map(code => code).join(', ')
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
    minWidth: 164,
    textAlign: 'center',
  }

  const creditString: () => string = () => {
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

  const coursePeriodText = () => {
    const periodNames =
      course.period?.map(period => period.name).filter(periodName => !/^exam_week_\d+$/.test(periodName)) ?? []
    const uniquePeriodNames = Array.from(new Set(periodNames))

    if (uniquePeriodNames.length === 0) {
      return null
    }

    return uniquePeriodNames.map(periodName => prettifyPeriodName(periodName)).join(', ')
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

  const periodText = coursePeriodText()
  const studyPlaceText = courseStudyPlaceText()
  const periodItems = periodText?.split(', ').filter(Boolean) ?? []
  const courseTitle =
    getDisplayCourseName(course, i18n.resolvedLanguage ?? i18n.language) ?? translateLocalizedString(course.name)

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
          <Typography variant="body2" sx={badgeStyles}>
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
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                {creditString()} {t('course:credits')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                {courseCodes}
              </Typography>
            </Stack>
            {studyPlaceText &&
              (() => {
                const StudyPlaceIcon = course.normalizedStudyPlace ? studyPlaceIcons[course.normalizedStudyPlace] : null
                return (
                  <Box
                    sx={{
                      ...badgeStyles,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    {StudyPlaceIcon && <StudyPlaceIcon sx={{ fontSize: 16, flexShrink: 0 }} />}
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', color: 'inherit' }}>
                      {studyPlaceText}
                    </Typography>
                  </Box>
                )
              })()}
          </Stack>
          {periodItems.length > 0 && <PeriodDisplay label={t('filter:period')} periods={periodItems} />}
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
