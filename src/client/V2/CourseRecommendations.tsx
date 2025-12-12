import { Box, Stack } from '@mui/material'
import { CourseRecommendation as CourseRecommendationType, UserCoordinates } from '../../common/types'
import { useTranslation } from 'react-i18next'
import CoursesInAccordionV2 from './CoursesInAccordionV2'
import { useFilterContext } from './filterContext'

const CourseRecommendations = () => {
  const { t } = useTranslation()
  const { courseRecommendations, selectedPeriods } = useFilterContext()

  const recommendations = courseRecommendations as CourseRecommendationsType

  const points = recommendations?.pointBasedRecommendations ?? []

  const filteredCourses =
    selectedPeriods.length > 0
      ? points.filter((c) => c.course.period?.name && selectedPeriods.includes(c.course.period.name))
      : points

  const summerText = t('form:summer')
  const periodText = t('form:period')

  type periodCourses = {
    courses: CourseRecommendationType[]
    name: string
  }

  const coursesByPeriod: Record<string, periodCourses> = {
    '0': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'intensive_3_previous'),
      name: summerText + '2025',
    },
    '1': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_1'),
      name: '1. ' + periodText,
    },
    '2': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_2'),
      name: '2. ' + periodText,
    },
    '3': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_3'),
      name: '3. ' + periodText,
    },
    '4': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_4'),
      name: '4. ' + periodText,
    },
    '5': {
      courses: filteredCourses.filter((c: CourseRecommendationType) => c.course.period?.name === 'intensive_3'),
      name: summerText + ' 2026',
    },
  }

  if(!recommendations || !points){
    return (<></>)
  }
  return (
    <Box>
      <Stack>
        <Stack
          spacing={2}
          sx={{
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >
          {Object.keys(coursesByPeriod).map((k) => (
            <CoursesInAccordionV2
              key={k}
              userCoordinates={recommendations.userCoordinates}
              defaultExpanded={false}
              courses={coursesByPeriod[k].courses}
              titleText={coursesByPeriod[k].name}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CourseRecommendations
