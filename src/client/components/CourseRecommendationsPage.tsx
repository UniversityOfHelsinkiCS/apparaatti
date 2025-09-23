import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material'
import type { CourseRecommendation as CourseRecommendationType, CourseRecommendations, UserCoordinates } from '../../common/types'
import ActionButton from './actionButton'
import CourseRecommendation from './CourseRecommendation'
import { useTranslation } from 'react-i18next'

const CourseRecommendationsPage = ({onClose, recommendations, display}: {onClose: () => void, recommendations: CourseRecommendations, display: boolean}) => {
  const {t} = useTranslation()
  const relevant: CourseRecommendationType[] = recommendations?.relevantRecommendations != null ? recommendations.relevantRecommendations : []
  const points: CourseRecommendationType[] = recommendations?.pointBasedRecommendations != null ? recommendations.pointBasedRecommendations : []
  const other: CourseRecommendationType[] = recommendations?.recommendations != null ? recommendations.recommendations : []

  return (
    <Box sx={{display: display === true ? 'block' : 'none'}}>
      <Stack>
        <ActionButton onClick={onClose} text={t('app:back')} dataCy="back-to-form"/>
        <Stack
          spacing={2}
          sx={{
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >

          <CourseListing userCoordinates={recommendations.userCoordinates} titleText = {t('recommendations:accurate')} defaultExpanded={true} courses={points}/>

          <CourseListing  userCoordinates={recommendations.userCoordinates} titleText = {t('recommendations:all')} defaultExpanded={true}  courses={other}/>
        
        </Stack>
      
      </Stack>
    </Box>
  )
}

const CourseListing = ({userCoordinates, defaultExpanded, courses, titleText}: {userCoordinates: UserCoordinates, defaultExpanded: boolean, courses: CourseRecommendationType[], titleText: string}) => {
  const {t} = useTranslation()
  const summerText = t('form:summer')
  const periodText = t('form:period')
  type periodCourses = {
    courses: CourseRecommendationType[]
    name: string 
  }
  const coursesByPeriod: Record<string,periodCourses> = {
    '0': {courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'intensive_3_previous'), name: summerText + '2025'},
    '1':{courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_1'), name: '1. ' + periodText},
    '2':{courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_2'), name: '2. ' + periodText},
    '3':{courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_3'), name: '3. ' + periodText},
    '4':{courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_4'), name: '4. ' + periodText},
    '5':{courses: courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_5'), name: summerText + ' 2026'},
     }
  return (
    
    <Accordion defaultExpanded = {defaultExpanded} sx={{background: 'lightgray'}}>
      <AccordionSummary
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography>{titleText}</Typography>
      </AccordionSummary>
      <AccordionDetails>
      {  Object.keys(coursesByPeriod).map((k) =>
         <CoursesInAccordion key={k} userCoordinates={userCoordinates} defaultExpanded={false} courses={coursesByPeriod[k].courses} titleText={coursesByPeriod[k].name}></CoursesInAccordion>)}

       </AccordionDetails>
    </Accordion>

  )
}


const CoursesInAccordion = ({userCoordinates, defaultExpanded, courses, titleText}: {userCoordinates: UserCoordinates, defaultExpanded: boolean, courses: CourseRecommendationType[], titleText: string}) => {
  return (
    
    <Accordion defaultExpanded = {defaultExpanded} sx={{background: 'white'}}>
      <AccordionSummary
        aria-controls="panel1-content"
        id="panel1-header"
      >
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
export default CourseRecommendationsPage
