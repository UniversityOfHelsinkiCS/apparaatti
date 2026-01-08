import MultiChoiceForm from './components/MultiChoiceForm.tsx'
import { AppBar, Toolbar, Typography, Button, Box, Stepper, Step, StepButton, SwipeableDrawer, Stack, } from '@mui/material'
import {  useContext, useEffect, useRef, useState } from 'react'
import CourseRecommendationsPage from './components/CourseRecommendationsPage.tsx'
import MenuIcon from '@mui/icons-material/Menu'
import { LanguageContext } from './contexts/languageContext.tsx'
import LanguageSelect from './components/LanguageSelect.tsx'
import { useTranslation } from 'react-i18next'
import useApi from './util/useApi.tsx'
import useApiMutation from './hooks/useApiMutation.tsx'
function App() {
  const {setDefaultLanguage} = useContext(LanguageContext)
  const topOfPage = useRef<HTMLAnchorElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [courseRecommendations, setCourseRecommendations] = useState([])
  const [questionarePhase, setQuestionarePhase] = useState(0)
  const {t} = useTranslation()
  const { data: user, isLoading: isUserLoading } = useApi('user', '/api/user', 'GET', null)
  
  useEffect(() => {
    if(!isUserLoading){
      setDefaultLanguage(user?.language) 
    }
  }, [user, isUserLoading])

  const { data: supportedOrganisations, isLoading: isSupportedOrganisationsLoading } = useApi('supportedOrganisations', '/api/organisations/supported', 'GET', null)
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
 
  const { data: studyData, isLoading: isStudyDataLoading } = useApi('studyData', '/api/user/studydata', 'GET', null)

  const submitAnswerMutation = useApiMutation(async (res) => {
    const recommendations = await res.json()
    console.log(recommendations)
    setCourseRecommendations(recommendations)
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
  }, '/api/form/answer')
 
  const handleSubmit = async (formData: FormData) => {
    const keys = Array.from(formData.keys())
    const answerData = Object.fromEntries(
      keys.filter(k => !k.includes('strict-filter') ).map((key) => {
        const value = formData.getAll(key)
        return [key, value.length > 1 ? value : value[0]]
      }))

    const strictFields = keys.filter(k => k.includes('strict-filter') ).map((key) => {
      const value = formData.getAll(key)
      return [key, value.length > 1 ? value : value[0]]
    })

    const payload = {
      answerData,
      strictFields
    }

    submitAnswerMutation.mutateAsync(payload, {
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

  if (isStudyDataLoading || isSupportedOrganisationsLoading) {
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
              Log In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <SwipeableDrawer anchor='right' open={settingsOpen} onOpen={() => {setSettingsOpen(true)}} onClose={() => {setSettingsOpen(false)}}>
        <Box sx={{minWidth: '50vw', padding: 3}}>
          <Stack direction={'row'}>
            <Typography>{user?.username}    
              <Button sx={{marginLeft: '3rem'}} color={'inherit'} href="/api/logout">
                {t('app:logout')}
              </Button>
                         </Typography>
          </Stack>
          <LanguageSelect/>
          <Button sx={{}} color={'inherit'} href="/v2">
            UI v2
          </Button>
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
            <Step sx={stepStyle}  key={0} completed={questionarePhase === 1}><StepButton color='inherit'>{t('app:questionaire')}</StepButton></Step>
            <Step sx={stepStyle} key={1}><StepButton color='inherit'>{t('app:recommendations')}</StepButton></Step>
          </Stepper>

          
          <MultiChoiceForm supportedOrganisations={supportedOrganisations} user={user} display={questionarePhase === 0} onSubmit={handleSubmit} studyData={studyData} />

          <CourseRecommendationsPage display={questionarePhase === 1} onClose={() => setQuestionarePhase(0)} recommendations={courseRecommendations}></CourseRecommendationsPage>
         
      
        </Box>
      </Box>
    </>
  )
}

export default App
