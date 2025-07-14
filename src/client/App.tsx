import MultiChoiceForm from './components/MultiChoiceForm.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Button, Box, Stepper, Step, StepButton, SwipeableDrawer, Stack, } from '@mui/material'
import {  useRef, useState } from 'react'
import CourseRecommendationsPage from './components/CourseRecommendationsPage.tsx'
import MenuIcon from '@mui/icons-material/Menu'
function App() {

  const topOfPage = useRef<HTMLAnchorElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [courseRecommendations, setCourseRecommendations] = useState([])
  const [questionarePhase, setQuestionarePhase] = useState(0)
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })
  const userId = user?.id
  //https://stackoverflow.com/questions/40326565/how-do-you-change-the-stepper-color-on-react-material-ui
  const stepStyle = {
    '& .MuiStepLabel-root .Mui-completed': {
      color: '#2196f3', 
    },
    '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
      color: 'grey',
    },
    '& .MuiStepLabel-root .Mui-active': {
      color: '#2196f3',
    },
    '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
            {
              color: 'grey', 
            },
    '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
      fill: 'black',
    },
  }
 
  const { data: studyData, isLoading: isStudyDataLoading } = useQuery({
    queryKey: ['studyData'],
    queryFn: async () => {
      const res = await fetch('/api/user/studydata')
      return res.json()
    },
    enabled: !!userId
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
    topOfPage.current?.scrollIntoView(true)
  }

  if(isUserLoading || user?.message === 'Unauthorized'){
    // window.location.assign('/api/login')
    return (
      <Stack direction='column' sx={{width: '100vw', height: '100vh'}}>
        <Typography variant='h2' sx={{marginLeft: 'auto', marginRight: 'auto'}}>Apparaatti</Typography> 
        <Typography sx={{marginLeft: 'auto', marginRight: 'auto'}}>Please log in: <a href="/api/login">here</a></Typography>
        
      </Stack>
    )
  }
 

  if (isStudyDataLoading) {
    return <div>Loading...</div>
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
              <Button onClick={() => setSettingsOpen(true)} color="inherit"><MenuIcon></MenuIcon></Button>
            </>
          ) : (
            <Button color="inherit" href="/api/login">
              Kirjaudu
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <SwipeableDrawer anchor='right' open={settingsOpen} onOpen={() => {setSettingsOpen(true)}} onClose={() => {setSettingsOpen(false)}}>
        <Box sx={{minWidth: '50vw', padding: 3}}>
          <Stack direction={'row'}>
            <Typography>{user?.username}    
              <Button sx={{marginLeft: '3rem'}} color={'inherit'} href="/api/logout">
                     Kirjaudu ulos
              </Button>
            </Typography>
          </Stack>
        </Box>
      </SwipeableDrawer>

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
            paddingLeft: 2,
            paddingRight: 1,
            backgroundColor: 'white',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '5vh',
            width: {sm: '50vw', sx: '100vw'}
          }}
        >
          <a ref={topOfPage} style={{display: 'none'}}></a>
          <Stepper sx={{
            padding: 3,
            background: '#f5f5f5'
          }} activeStep={questionarePhase} alternativeLabel>
            <Step sx={stepStyle}  key={0} completed={questionarePhase === 1}><StepButton color='inherit'>Kysely</StepButton></Step>
            <Step sx={stepStyle} key={1}><StepButton color='inherit'>Ehdotukset</StepButton></Step>
          </Stepper>

          
          <MultiChoiceForm display={questionarePhase === 0} onSubmit={handleSubmit} studyData={studyData} />

          <CourseRecommendationsPage display={questionarePhase === 1} onClose={() => setQuestionarePhase(0)} recommendations={courseRecommendations}></CourseRecommendationsPage>
         
      
        </Box>
      </Box>
    </>
  )
}

export default App
