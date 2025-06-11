import MultiChoiceForm from './components/MultiChoiceForm.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Form } from '../common/types.ts'
import { AnswerSchema } from '../common/validators.ts'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useState } from 'react'
import CourseRecommendationsPanel from './components/CourseRecommendationsPanel.tsx'
import MultiChoiceFormV2 from './components/MultiChoiceFormV2.tsx'

function App() {
  const [courseRecommendations, setCourseRecommendations] = useState([])
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  const { data: form, isLoading } = useQuery<Form>({
    queryKey: ['form'],
    queryFn: async () => {
      const res = await fetch('/api/form/1')
      return res.json()
    },
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })


  const {data: studyData, isLoading: isStudyDataLoading} = useQuery({
    queryKey: ['studyData'],
    queryFn: async () => {
      const res = await fetch('/api/user/studydata')
      return res.json()
    },
  })

  const submitAnswerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const answerData = AnswerSchema.parse(Object.fromEntries(formData))

      const res = await fetch('/api/form/1/answer', {
        method: 'POST',
        body: JSON.stringify(answerData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
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
    setIsSidePanelOpen(true)
  }

  if (isLoading || !form || isStudyDataLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <AppBar position="fixed" sx={{ 
        backgroundColor: 'white', 
        color: 'black', 
        boxShadow: 'none', 
        borderBottom: '1px solid #e0e0e0' }}>
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
      <Box sx={{
        paddingTop: 10,
      }}>  
        <MultiChoiceForm onSubmit={handleSubmit} studyData={studyData}/>
      
      </Box>
      {isSidePanelOpen && <CourseRecommendationsPanel onClose={() => setIsSidePanelOpen(false)}  recommendations={courseRecommendations}/>}
    </>
  )
}

export default App
