import { useState, useEffect } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import CourseRecommendation from './CourseRecommendation'

const CourseRecommendationsPanel = ({
  onClose,
  recommendations,
}: {
  onClose: () => void
  recommendations: CourseRecommendationType[]
}) => {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300) // Match the animation duration
  }

  useEffect(() => {
    setIsClosing(false) // Reset closing state when the component is mounted
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '50vw',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        marginTop: 8,
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
        animation: isClosing
          ? 'slide-out 0.3s forwards'
          : 'slide-in 0.3s forwards',
        '@keyframes slide-in': {
          from: {
            transform: 'translateX(100%)',
          },
          to: {
            transform: 'translateX(0)',
          },
        },
        '@keyframes slide-out': {
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(100%)',
          },
        },
      }}
    >
      <Button
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          minWidth: '24px',
          height: '24px',
          padding: 0,
          margin: 1,
          fontSize: '1rem',
          lineHeight: 1,
          color: 'black',
          background: 'none',
          border: '1px solid lightgray',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: 'lightgray',
          },
        }}
      >
        X
      </Button>
      <Stack>
        <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 6 }}>
          Ehdotetut kurssit:
        </Typography>
        <Stack
          spacing={2}
          sx={{
            maxHeight: '80vh',
            overflowY: 'auto',
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >
          {recommendations.map((course) => (
            <CourseRecommendation key={course.course.id} course={course} />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CourseRecommendationsPanel
