import MultiChoiceForm from './components/MultiChoiceForm.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Button, Box, Stepper, Step, StepLabel, StepButton } from '@mui/material'
import { useState } from 'react'
import CourseRecommendationsPage from './components/CourseRecommendationsPage.tsx'

function App() {
  const [courseRecommendations, setCourseRecommendations] = useState([])
  const [questionarePhase, setQuestionarePhase] = useState(0)
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })

  const { data: studyData, isLoading: isStudyDataLoading } = useQuery({
    queryKey: ['studyData'],
    queryFn: async () => {
      const res = await fetch('/api/user/studydata')
      return res.json()
    },
  })

  const submitAnswerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      
      
      const keys = Array.from(formData.keys())
      const answerData = Object.fromEntries(
        keys.map((key) => {
          const value = formData.getAll(key)
          return [key, value.length > 1 ? value : value[0]]
        })
      )


     
      console.log(answerData)
      const res = await fetch('/api/form/1/answer', {
        method: 'POST',
        body: JSON.stringify(answerData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log(res)
      //if (res.status === 500) {
      //  throw new Error("Internal server error")
      //}
      const recommendations = await res.json()
      console.log(recommendations)
      setCourseRecommendations(recommendations)
      if (!res.ok) {
        throw new Error('Network response was not ok')
      }
    },
  })

  const handleSubmit = async (formData: FormData) => {
    submitAnswerMutation.mutateAsync(formData, {
      onSuccess: () => {
        console.log('Form submitted successfully')
      },
    })
    setQuestionarePhase(1)
  }

  if (isStudyDataLoading) {
    return <div>Loading...</div>
  }


  const renderQuestionare = () => {
    switch(questionarePhase){
    case 0:
      return <MultiChoiceForm onSubmit={handleSubmit} studyData={studyData} />
    case 1:
      return <CourseRecommendationsPage onClose={() => setQuestionarePhase(0)} recommendations={courseRecommendations}></CourseRecommendationsPage>
    }
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#f5f5f5',
          color: 'black',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Apparaatti
          </Typography>
          {user?.username ? (
            <>
              <Button color="inherit">Tervetuloa, {user.username}</Button>
              <Button color="inherit" href="/api/logout">
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" href="/api/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          paddingTop: 10,
          backgroundColor: 'white',
          minHeight: '100vh',
          minWidth: '100vw',
        }}
      >

      
        <Box
          sx={{
            paddingTop: 10,
            backgroundColor: 'white',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '50vw'
          }}
        >
          <Stepper sx={{
            padding: 3,
            background: '#f5f5f5'
          }} activeStep={questionarePhase} alternativeLabel>
            <Step  key={0} completed={questionarePhase === 1}><StepButton color='inherit'>Kysely</StepButton></Step>
            <Step key={1} completed={questionarePhase === 1}><StepButton color='inherit'>Ehdotukset</StepButton></Step>
          </Stepper>

          {renderQuestionare()}
      
        </Box>
      </Box>
    </>
  )
}

export default App
