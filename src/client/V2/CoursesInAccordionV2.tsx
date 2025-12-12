import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { CourseRecommendation as CourseRecommendationType, UserCoordinates } from '../../common/types'
import CourseRecommendation from '../components/CourseRecommendation'

const CoursesInAccordionV2 = ({
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
  if (courses.length === 0) {
    return null
  }

  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ background: 'white' }}>
      <AccordionSummary aria-controls="panel1-content" id="panel1-header">
        <Typography>{titleText}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {courses.map((course) => (
          <CourseRecommendation userCoordinates={userCoordinates} key={course.course.id} course={course} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default CoursesInAccordionV2
