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

          <CourseListing userCoordinates={recommendations.userCoordinates} titleText = {t('recommendations:pointbased')} defaultExpanded={true} courses={points}/>

          <CourseListing  userCoordinates={recommendations.userCoordinates} titleText = {t('recommendations:all')} defaultExpanded={true}  courses={other}/>
        
        </Stack>
      
      </Stack>
    </Box>
  )
}
const CourseListing = ({userCoordinates, defaultExpanded, courses, titleText}: {userCoordinates: UserCoordinates, defaultExpanded: boolean, courses: CourseRecommendationType[], titleText: string}) => {

  const coursesByPeriod: Record<string, CourseRecommendationType[]> = {
    '1': courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_1'),
    '2': courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_2'),
    '3': courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_3'),
    '4': courses.filter((c: CourseRecommendationType)=> c.course.period?.name === 'period_4')
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
        <Typography>1</Typography>
        {coursesByPeriod['1'].map((course) => (
          <CourseRecommendation userCoordinates={userCoordinates} key={course.course.id} course={course} />
        ))}
        <Typography>2</Typography>
        {coursesByPeriod['2'].map((course) => (
          <CourseRecommendation userCoordinates={userCoordinates} key={course.course.id} course={course} />
        ))}
        <Typography>3</Typography>
        {coursesByPeriod['3'].map((course) => (
          <CourseRecommendation userCoordinates={userCoordinates} key={course.course.id} course={course} />
        ))}
        <Typography>4</Typography>
        {coursesByPeriod['4'].map((course) => (
          <CourseRecommendation userCoordinates={userCoordinates} key={course.course.id} course={course} />
        ))}      </AccordionDetails>
    </Accordion>

  )
}

export default CourseRecommendationsPage
