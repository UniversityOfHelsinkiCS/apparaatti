import React from 'react';
import { CourseRecommendation as CourseRecommendationType } from '/common/types';
import { Box, Paper, Typography } from '@mui/material';

const CourseRecommendation = ({ course }: { course: CourseRecommendationType }) => {
  if (!course) return null;

  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {course.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         {course.courseCode}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         opintopisteet: {course.credits}
        </Typography>
        <p>
          Jännitys: {course.courseRecommendationCoordinates.fear}, Opetusmuoto: {course.courseRecommendationCoordinates.teachingMethod}, Kokemus: {course.courseRecommendationCoordinates.experience}
        </p>
      </Box>
    </Paper>
  );
};

export default CourseRecommendation;