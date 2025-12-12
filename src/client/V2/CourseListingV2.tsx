import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { CourseRecommendation as CourseRecommendationType, UserCoordinates } from '../../common/types'
import { useTranslation } from 'react-i18next'
import CoursesInAccordionV2 from './CoursesInAccordionV2'

const CourseListingV2 = ({
  userCoordinates,
  defaultExpanded,
  courses,
  titleText,
}: {
  userCoordinates: UserCoordinates
  defaultExpanded: boolean
  courses: CourseRecommendationType[]
  titleText: string
}) => {
  const { t } = useTranslation()
  const summerText = t('form:summer')
  const periodText = t('form:period')

  type periodCourses = {
    courses: CourseRecommendationType[]
    name: string
  }

  const coursesByPeriod: Record<string, periodCourses> = {
    '0': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'intensive_3_previous'),
      name: summerText + '2025',
    },
    '1': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_1'),
      name: '1. ' + periodText,
    },
    '2': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_2'),
      name: '2. ' + periodText,
    },
    '3': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_3'),
      name: '3. ' + periodText,
    },
    '4': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'period_4'),
      name: '4. ' + periodText,
    },
    '5': {
      courses: courses.filter((c: CourseRecommendationType) => c.course.period?.name === 'intensive_3'),
      name: summerText + ' 2026',
    },
  }


  if(!courses){
    return (<></>)
  }
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ background: 'lightgray' }}>
      <AccordionSummary aria-controls="panel1-content" id="panel1-header">
        <Typography>{titleText}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Object.keys(coursesByPeriod).map((k) => (
          <CoursesInAccordionV2
            key={k}
            userCoordinates={userCoordinates}
            defaultExpanded={false}
            courses={coursesByPeriod[k].courses}
            titleText={coursesByPeriod[k].name}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseListingV2
