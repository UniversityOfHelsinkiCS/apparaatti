import { Box, Modal, Stack, Typography } from '@mui/material'
import { CourseRecommendation, UserCoordinates } from '../../common/types'
import useQuestions from '../hooks/useQuestions'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'




const RecommendationReasonsModal = ({recommendation, open, handleClose, userCoordinates}: {recommendation: CourseRecommendation, open: boolean, handleClose: () => void, userCoordinates: UserCoordinates}) => {

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
    height: '100vh',
    overflowY: 'scroll'
  }
  const questions = useQuestions()
  return(
    <Modal

      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {questions.map((q) =>
          <RecommendationReason userCoordinates={userCoordinates} key={q.id} question={q} recommendation={recommendation}></RecommendationReason>)}
      </Box>
    </Modal>
  )
}


const RecommendationReason = ({question, recommendation, userCoordinates}: {question: any, recommendation: CourseRecommendation, userCoordinates: UserCoordinates}) => {
  const {t} = useTranslation()
  const [isMatch, setMatch] = useState(false)
  const checkIsMatching = () => {
    const coordKey = question.effects
    const course = recommendation
    const userValue = userCoordinates[coordKey]
    if(coordKey === 'date'){
      const userDate = new Date(userValue)
      const courseDate = new Date(course.coordinates[coordKey])
      const difference = Math.abs(userDate - courseDate)
      const daysDifference = difference / (1000 * 60 * 60 * 24)
      if(daysDifference < 30){
        setMatch(true)
      }
    }

    if(userValue === course.coordinates[coordKey]){
      setMatch(true)
    }
  }

  useEffect(() => {
    checkIsMatching()
  }, [])
    
  return(
    <Box sx={{padding: '1rem', margin: '0.5rem', borderColor: 'gray', borderWidth: '1px', borderStyle: 'solid'}}>
      <Typography sx={{fontSize: '1.2rem'}}>{question.variants[0].question}</Typography>

      <Typography sx={{fontSize: '1.2rem'}}>{isMatch ? '100%' : '0%'}</Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        {question.explanation ? question.explanation : t('question:noExtrainfo')}
      </Typography>
    </Box>
  )
}

export default RecommendationReasonsModal
