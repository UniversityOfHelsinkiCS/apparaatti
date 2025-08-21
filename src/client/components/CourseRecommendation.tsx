import type { CourseRecommendation as CourseRecommendationType, UserCoordinates } from '../../common/types'
import { Box, Button, major, Paper, Stack, Typography } from '@mui/material'
import { translateLocalizedString } from '../util/i18n'
import { useTranslation } from 'react-i18next'
import useQuestions from '../hooks/useQuestions'

const CourseRecommendation = ({
  course,
  userCoordinates
}: {
  course: CourseRecommendationType,
  userCoordinates: UserCoordinates
}) => {
  const {t} = useTranslation()
  if (!course) return null
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.course.id}`
  const courseCodes = course.course.courseCodes.map((code) => code).join(', ')

  const creditString:() => string = () => {
    if(!course.course.credits){
      return ''
    }
    const maxCredits: number = course.course.credits.map(c=>c['max']).sort((a, b) => b - a )[0]
    const minCredits: number= course.course.credits.map(c => c['min']).sort()[0]

    if(!maxCredits && !minCredits){
      return ''
    }
    else if(!minCredits){
      return maxCredits.toString()
    }
    else if(!maxCredits){
      return minCredits.toString()
    }
    else if(maxCredits === minCredits){
      return maxCredits.toString()
    }

    return  minCredits + '-' + maxCredits
  }
  const courseDateRange = (course: any) => {
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
  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {translateLocalizedString(course.course.name)}
        </Typography>
        <Stack direction={'column'}>
          <Stack direction={'row'}>
            <Typography
              sx={{ marginRight: 'auto' }}
              variant="body2"
              color="textSecondary"
              gutterBottom
            >
              {creditString()} {t('course:credits')}
            </Typography>

            <Typography
              sx={{ marginRight: 'auto' }}
              variant="body2"
              color="textSecondary"
              gutterBottom
            >
              {courseCodes}
            </Typography>

            <Typography>{courseDateRange(course.course)}</Typography>
          </Stack>
          <RecommendationReasons course={course} userCoordinates={userCoordinates}/>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ marginTop: 1 }}
        >
          {t('course:show')}
        </Button>
      </Box>
    </Paper>
  )
}


const RecommendationReasons = ({course, userCoordinates}: {course: CourseRecommendationType, userCoordinates: UserCoordinates}) => {
  const questions = useQuestions()
  const getRecommendationNumbers = () => {
    const sameCoord = []
    const incorrectCoord = []
    const courseCoordKeys = Object.keys(course.coordinates)
    for(const coordKey of courseCoordKeys){
      const userValue = userCoordinates[coordKey]
      if(userValue === course.coordinates[coordKey]){
        sameCoord.push(coordKey)
      }
      else{
        incorrectCoord.push(coordKey)
      }
    }
    const correctQuestionNumbers = questions.filter((q) => sameCoord.includes(q.effects)).map((q) => q.number)
    const inCorrectQuestionNumbers = questions.filter((q) => incorrectCoord.includes(q.effects)).map((q) => q.number)
    return {correct: correctQuestionNumbers, incorrect: inCorrectQuestionNumbers}
    console.log('coord keys: ', sameCoord)
  }

  const numbers = getRecommendationNumbers()
  return (
    <Stack direction={'row'}>
      {numbers.correct.map((n) => <NumberBall key={n} number={n} numberType={'correct'}/>)}
      {numbers.incorrect.map((n) => <NumberBall key={n} number={n} numberType={'incorrect'}/>)}
    </Stack>
  )
}

const NumberBall = ({number, numberType}: {number: string, numberType: string}) => {
  const style = {
    display: 'flex',
    marginRight: '0.5rem',
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    textAlign: 'center',
    placeItems: 'center',
    justifyItems: 'center',
    alignContent: 'center',
    flexWrap: 'wrap'
  
  }
  return (
    <>
      {numberType === 'correct' ? 
        <Box sx={{...style, backgroundColor: 'lightblue'}}>
          <Typography sx={{marginLeft: 'auto', marginRight: 'auto'}}>
            {number}
          </Typography>
        </Box>
        :
        <Box sx={{...style, backgroundColor: 'orangered'}}>
          <Typography sx={{marginLeft: 'auto', marginRight: 'auto'}}>
            {number}
          </Typography>
        </Box>
      }
    </>
  )
}

export default CourseRecommendation
